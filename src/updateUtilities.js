import { ObjectId } from "mongodb";

import { MongoIdType, MongoIdArrayType, DateType, StringType, StringArrayType, IntArrayType, FloatArrayType } from "./dataTypes";
import { insertObjects, newObjectFromArgs } from "./insertUtilities";
import { fillMongoFiltersObject } from "./queryUtilities";

export async function getUpdateObject(updatesObject, typeMetadata, relationshipLoadingUtils = {}) {
  let $set = {};
  let $inc = {};
  let $push = {};
  let $pull = {};
  let $addToSet = {};

  await getUpdateObjectContents(updatesObject, typeMetadata, "", $set, $inc, $push, $pull, $addToSet, relationshipLoadingUtils);
  let result = { $set, $inc, $push, $pull, $addToSet };
  Object.keys(result).forEach(k => {
    if (!Object.keys(result[k]).length) {
      delete result[k];
    }
  });
  return result;
}

async function getUpdateObjectContents(updatesObject, typeMetadata, prefix, $set, $inc, $push, $pull, $addToSet, options) {
  let { db, ...rest } = options;
  let relationships = typeMetadata.relationships || {};

  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    let fkType = typeMetadata.fields[relationship.fkField];
    let keyField = relationship.keyField;
    if (relationship.__isArray && !relationship.oneToMany) {
      if (updatesObject[`${k}_ADD`]) {
        let newObjects = await insertObjects(updatesObject[`${k}_ADD`], relationship.type, options);

        if (!updatesObject[`${relationship.fkField}_ADDTOSET`]) {
          updatesObject[`${relationship.fkField}_ADDTOSET`] = [];
        }
        updatesObject[`${relationship.fkField}_ADDTOSET`].push(...newObjects.map(o => (fkType == StringArrayType ? "" + o[keyField] : o[keyField])));
      }
    } else if (relationship.__isObject) {
      if (updatesObject[`${k}_SET`]) {
        let newObject = (await insertObjects(updatesObject[`${k}_SET`], relationship.type, options))[0];
        if (newObject) {
          updatesObject[relationship.fkField] = fkType == StringType ? "" + newObject[keyField] : newObject[keyField];
        }
      }
    }
  }

  for (let k of Object.keys(updatesObject)) {
    let field = typeMetadata.fields[k];

    if (!field) {
      let pieces = k.split("_");
      let queryOperation = pieces.slice(-1)[0];
      let fieldName = pieces.slice(0, pieces.length - 1).join("_");
      field = typeMetadata.fields[fieldName];

      if (queryOperation === "INC") {
        $inc[prefix + fieldName] = updatesObject[k];
      } else if (queryOperation === "DEC") {
        $inc[prefix + fieldName] = updatesObject[k] * -1;
      } else if (queryOperation === "PUSH") {
        if (field === StringArrayType || field === IntArrayType || field == FloatArrayType) {
          $push[prefix + fieldName] = { $each: [updatesObject[k]] };
        } else {
          let toAdd = await newObjectFromArgs(updatesObject[k], field.type, options);
          $push[prefix + fieldName] = { $each: [toAdd] };
        }
      } else if (queryOperation === "CONCAT") {
        if (!$push[prefix + fieldName]) {
          $push[prefix + fieldName] = { $each: [] };
        }
        if (field === StringArrayType || field === IntArrayType || field == FloatArrayType) {
          $push[prefix + fieldName].$each.push(...updatesObject[k]);
        } else {
          let toAdd = await Promise.all(updatesObject[k].map(argsItem => newObjectFromArgs(argsItem, field.type, options)));
          $push[prefix + fieldName].$each.push(...toAdd);
        }
      } else if (queryOperation === "UPDATE") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $set[prefix + `${fieldName}.${updatesObject[k].index}`] =
            field === MongoIdArrayType ? ObjectId(updatesObject[k].value) : updatesObject[k].value;
        } else if (field.__isArray) {
          await getUpdateObjectContents(
            updatesObject[k].Updates,
            field.type,
            prefix + `${fieldName}.${updatesObject[k].index}.`,
            $set,
            $inc,
            $push,
            $pull,
            $addToSet,
            options
          );
        } else {
          await getUpdateObjectContents(updatesObject[k], field.type, prefix + `${fieldName}.`, $set, $inc, $push, $pull, $addToSet, options);
        }
      } else if (queryOperation === "UPDATES") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          updatesObject[k].forEach(update => {
            $set[prefix + `${fieldName}.${update.index}`] = field === MongoIdArrayType ? ObjectId(update.value) : update.value;
          });
        } else {
          for (let update of updatesObject[k]) {
            await getUpdateObjectContents(
              update.Updates,
              field.type,
              prefix + `${fieldName}.${update.index}.`,
              $set,
              $inc,
              $push,
              $pull,
              $addToSet,
              options
            );
          }
        }
      } else if (queryOperation === "PULL") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $pull[prefix + fieldName] = { $in: field === MongoIdArrayType ? updatesObject[k].map(val => ObjectId(val)) : updatesObject[k] };
        } else {
          $pull[prefix + fieldName] = fillMongoFiltersObject(updatesObject[k], field.type);
        }
      } else if (queryOperation === "ADDTOSET") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $addToSet[prefix + fieldName] = { $each: field === MongoIdArrayType ? updatesObject[k].map(val => ObjectId(val)) : updatesObject[k] };
        }
      }
    } else {
      if (field == DateType || (typeof field === "object" && field.__isDate)) {
        $set[prefix + k] = new Date(updatesObject[k]);
      } else if (field.__isArray) {
        $set[prefix + k] = await Promise.all(updatesObject[k].map(argsItem => newObjectFromArgs(argsItem, field.type, options)));
      } else if (field.__isObject) {
        $set[prefix + k] = await newObjectFromArgs(updatesObject[k], field.type, options);
      } else {
        if (field === MongoIdArrayType) {
          $set[prefix + k] = updatesObject[k].map(item => ObjectId(item));
        } else if (field === MongoIdType) {
          $set[prefix + k] = ObjectId(updatesObject[k]);
        } else {
          $set[prefix + k] = updatesObject[k];
        }
      }
    }
  }
}

export async function setUpOneToManyRelationshipsForUpdate(_ids, args, typeMetadata, options = {}) {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      let coll = args[`${k}_ADD`];
      if (coll) {
        coll.forEach(newObj => {
          if (/Array/.test(relationship.type.fields[relationship.keyField])) {
            if (!newObj[relationship.keyField]) {
              newObj[relationship.keyField] = [];
            }
            newObj[relationship.keyField].push(..._ids);
          } else {
            newObj[relationship.keyField] = _ids[0];
          }
        });
        await insertObjects(coll, relationship.type, options);
      }
    }
  }
}
