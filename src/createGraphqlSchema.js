import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

import { MongoIdType, StringArrayType, MongoIdArrayType, IntArrayType, FloatArrayType } from "./dataTypes";
import createTypeResolver from "./codeGen/createTypeResolver";
import createGraphqlTypeSchema from "./codeGen/createTypeSchema";
import createOutputTypeMetadata from "./codeGen/createTypeMetadata";
import createMasterSchema from "./codeGen/createMasterSchema";
import createMasterResolver from "./codeGen/createMasterResolver";

function createFile(path, contents, onlyIfAbsent, ...directoriesToCreate) {
  directoriesToCreate.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
  if (!onlyIfAbsent || !fs.existsSync(path)) {
    fs.writeFileSync(path, contents);
  }
}

export default function(source, destPath, options = {}) {
  return Promise.resolve(source).then(graphqlMetadata => {
    let rootDir = path.join(destPath, "graphQL");
    if (!fs.existsSync(rootDir)) {
      mkdirp.sync(rootDir);
    }
    let typeLookup = new Map([]);
    Object.keys(graphqlMetadata).forEach(k => {
      typeLookup.set(k, graphqlMetadata[k]);
    });
    Object.keys(graphqlMetadata).forEach(k => {
      let type = graphqlMetadata[k];
      type.__name = k;
      if (!type.fields) graphqlMetadata[k].fields = {};
      if (!type.fields._id && type.table) {
        //add _id, and as a bonus, make it show up first in the list since the spec iterates object keys in order of insertion
        type.fields = { _id: MongoIdType, ...type.fields };
      }
      if (type.relationships) {
        Object.keys(type.relationships).forEach(k => {
          let relationship = type.relationships[k];
          if (!relationship.keyField) {
            relationship.keyField = "_id";
          }
          let fkFieldId = type.fields[relationship.fkField];
          let keyField = relationship.keyField;

          let fkArray = [StringArrayType, MongoIdArrayType, IntArrayType, FloatArrayType].includes(fkFieldId);
          relationship.__isArray = (fkArray || keyField !== "_id") && !relationship.oneToOne;
          relationship.__isObject = !relationship.__isArray;

          if (relationship.oneToOne && relationship.oneToMany) {
            throw "Config props oneToOne and oneToMany cannot both be set";
          }
          if (relationship.oneToOne || relationship.oneToMany) {
            if (fkArray) {
              throw `Foreign key ${relationship.fkField} on ${type.__name} is incompatible with relationship types oneToOne and oneToMany`;
            }
          }

          if (relationship.__isArray) {
            if (fkArray) {
              relationship.manyToMany = true;
            } else {
              relationship.oneToMany = true;
            }
          }
          if (relationship.oneToMany) {
            type.hasOneToManyRelationship = true;
          }
        });
      } else {
        type.relationships = {};
      }
    });
    let modules = Object.keys(graphqlMetadata).map(k => graphqlMetadata[k]);

    let names = [];
    let namesWithTables = [];
    let namesWithoutTables = [];
    modules.forEach(objectToCreate => {
      let objName = objectToCreate.__name;
      let modulePath = path.join(rootDir, objName);
      let objPath = path.join(modulePath, objName + ".js");
      let schemaPath = path.join(modulePath, "schema.js");
      let resolverPath = path.join(modulePath, "resolver.js");

      names.push(objName);
      if (objectToCreate.table) {
        namesWithTables.push(objName);
      } else {
        namesWithoutTables.push(objName);
      }

      createFile(objPath, createOutputTypeMetadata(objectToCreate), true, modulePath);

      createFile(schemaPath, createGraphqlTypeSchema(objectToCreate), true);
      if (objectToCreate.table) {
        createFile(resolverPath, createTypeResolver(objectToCreate, { ...options, modulePath }), true);
      }
    });

    fs.writeFileSync(path.join(rootDir, "schema.js"), createMasterSchema(names, namesWithTables, namesWithoutTables));

    fs.writeFileSync(path.join(rootDir, "resolver.js"), createMasterResolver(namesWithTables));
    if (!options.hooks && !fs.existsSync(path.join(rootDir, "hooks.js"))) {
      fs.writeFileSync(
        path.join(rootDir, "hooks.js"),
        fs.readFileSync(path.resolve(__dirname, "./codeGen/processingHooksTemplate.js"), { encoding: "utf8" })
      );
    }
  });
}
