import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

import { MongoIdType, StringArrayType, MongoIdArrayType, IntArrayType, FloatArrayType } from "./dataTypes";
import createTypeResolver from "./codeGen/createTypeResolver";
import createGraphqlTypeSchema from "./codeGen/createTypeSchema";
import createOutputTypeMetadata from "./codeGen/createTypeMetadata";
import createMasterSchema from "./codeGen/createMasterSchema";

import createMasterResolver from "./codeGen/createMasterResolver";
import createTypeScriptTypes from "./codeGen/createTypeScriptTypes";
import createTestSchema from "./codeGen/createTestSchema";

import prettier from "prettier";

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

const formatGraphQL = code => prettier.format(code, { parser: "graphql" });
const formatJs = code => prettier.format(code, { parser: "babel", printWidth: 120, arrowParens: "avoid", trailingComma: "none" });

export default function (source, destPath, options = {}) {
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
          if (relationship.oneToMany && !relationship.readonly) {
            type.hasMutableOneToManyRelationship = true;
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
    let namesWriteable = [];
    let types = [];

    modules.forEach(objectToCreate => {
      let objName = objectToCreate.__name;
      let modulePath = path.join(rootDir, objName);
      let objPath = path.join(modulePath, objName + ".js");
      let schemaPath = path.join(modulePath, "schema.js");
      let resolverPath = path.join(modulePath, "resolver.js");

      names.push(objName);
      types.push(objectToCreate);
      if (objectToCreate.table) {
        namesWithTables.push(objName);
        if (!objectToCreate.readonly) {
          namesWriteable.push(objName);
        }
      } else {
        namesWithoutTables.push(objName);
      }

      createFile(objPath, formatJs(createOutputTypeMetadata(objectToCreate)), true, modulePath);

      createFile(schemaPath, formatJs(createGraphqlTypeSchema(objectToCreate)), true);
      if (objectToCreate.table) {
        createFile(resolverPath, formatJs(createTypeResolver(objectToCreate, { ...options, modulePath })), true);
      }
    });

    const schemaAdditions = (options.schemaAdditions || []).map(path => fs.readFileSync(path, { encoding: "utf8" }));
    const resolverAdditions = (options.resolverAdditions || []).map(uri => path.relative(rootDir, uri).replace(/\\/g, "/"));
    fs.writeFileSync(
      path.join(rootDir, "schema.js"),
      formatJs(createMasterSchema(names, namesWithTables, namesWithoutTables, namesWriteable, schemaAdditions))
    );

    const schemaModule = require(path.join(rootDir, "schema.js"));
    const masterSchema = formatGraphQL(schemaModule.default);
    fs.writeFileSync(path.join(rootDir, "entireSchema.gql"), masterSchema);

    try {
      fs.writeFileSync(
        path.join(rootDir, "test-resolvers.js"),
        formatJs(createTestSchema(names, namesWithTables, namesWithoutTables, namesWriteable, types))
      );
    } catch (er) {
      console.log("ERROR GENERATING RESOLVER TESTS", er);
    }

    let result;

    if (options.typings) {
      result = createTypeScriptTypes(masterSchema, options.typings).catch(er => {
        console.log("\n\nERROR GENERATING TS TYPES\n\n", er);
      });
    }

    fs.writeFileSync(path.join(rootDir, "resolver.js"), formatJs(createMasterResolver(namesWithTables, namesWriteable, resolverAdditions)));
    if (!options.hooks && !fs.existsSync(path.join(rootDir, "hooks.js"))) {
      fs.writeFileSync(
        path.join(rootDir, "hooks.js"),
        formatJs(fs.readFileSync(path.resolve(__dirname, "./codeGen/processingHooksTemplate.js"), { encoding: "utf8" }))
      );
    }

    return result;
  });
}
