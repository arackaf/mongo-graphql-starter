import { ObjectId } from "mongodb";

import { processInsertions } from "./dbHelpers";
import { MongoIdType, MongoIdArrayType, StringType, StringArrayType, DateType } from "./dataTypes";

export async function insertObjects(argsArray, typeMetadata, options) {
  if (!Array.isArray(argsArray)) {
    argsArray = [argsArray];
  }
  let { db, ...rest } = options;
  let objArray = await Promise.all(argsArray.map(o => newObjectFromArgs(o, typeMetadata, options)));
  let argsMap = new Map(objArray.map((o, i) => [o, argsArray[i]]));
  let newObjects = await processInsertions(db, objArray, { ...rest, typeMetadata });

  await Promise.all(newObjects.map(o => setUpOneToManyRelationships(o, argsMap.get(o), typeMetadata, { db, ...rest })));
  return newObjects;
}

export async function setUpOneToManyRelationships(newObject, args, typeMetadata, options = {}) {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      if (args[k]) {
        args[k].forEach(newObj => {
          let keyValue = newObject[relationship.fkField];
          if (typeMetadata.fields[relationship.fkField] == MongoIdType) {
            keyValue = "" + keyValue;
          }
          if (/Array/.test(relationship.type.fields[relationship.keyField])) {
            if (!newObj[relationship.keyField]) {
              newObj[relationship.keyField] = [];
            }
            newObj[relationship.keyField].push(keyValue);
          } else {
            newObj[relationship.keyField] = keyValue;
          }
        });
        await insertObjects(args[k], relationship.type, options);
      }
    }
  }
}

export async function newObjectFromArgs(args, typeMetadata, options) {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      continue;
    }
    if (relationship.__isArray) {
      if (args[k]) {
        let newObjects = await insertObjects(args[k], relationship.type, options);

        let fkType = typeMetadata.fields[relationship.fkField];
        let keyField = relationship.keyField;

        if (!args[`${relationship.fkField}`]) {
          args[`${relationship.fkField}`] = [];
        }
        args[`${relationship.fkField}`].push(...newObjects.map(o => (fkType == StringArrayType ? "" + o[keyField] : o[keyField])));
      }
    } else if (relationship.__isObject) {
      if (args[k]) {
        let newObject = (await insertObjects(args[k], relationship.type, options))[0];

        let fkType = typeMetadata.fields[relationship.fkField];
        let keyField = relationship.keyField;

        if (newObject) {
          if (!args[`${relationship.fkField}`]) {
            args[`${relationship.fkField}`] = [];
          }
          args[`${relationship.fkField}`] = fkType == StringType ? "" + newObject[keyField] : newObject[keyField];
        }
      }
    }
  }

  let keyValuePairs = (await Promise.all(
    Object.keys(args).map(async k => {
      let field = typeMetadata.fields[k];
      if (!field) return null;

      if (field == DateType || field.__isDate) {
        return [k, new Date(args[k])];
      } else if (field.__isArray) {
        return [k, await Promise.all(args[k].map(argItem => newObjectFromArgs(argItem, field.type, options)))];
      } else if (field.__isObject) {
        return [k, await newObjectFromArgs(args[k], field.type, options)];
      } else if (field === MongoIdArrayType) {
        return [k, args[k].map(val => ObjectId(val))];
      } else if (field === MongoIdType) {
        return [k, ObjectId(args[k])];
      } else {
        return [k, args[k]];
      }
    })
  )).filter(x => x);

  return keyValuePairs.reduce((obj, [k, val]) => ((obj[k] = val), obj), {});
}
