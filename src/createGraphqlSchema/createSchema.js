import path from "path";
import fs from "fs";

import { createObject, createGraphqlSchema, createGraphqlResolver } from "./createCode";

import { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf } from "./dataTypes";

const defaultDateFormat = "%m/%d/%Y";

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

export default function(source, destPath) {
  Promise.resolve(source).then(module => {
    let rootDir = path.join(destPath, "graphQL");
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir);
    }
    Object.keys(module).forEach(k => {
      module[k].__name = k;
      if (!module[k].fields._id && module[k].table) {
        //add _id, and as a bonus, make it show up first in the list since the spec iterates object keys in order of insertion
        module[k].fields = { _id: MongoIdType, ...module[k].fields };
      }
    });
    let modules = Object.keys(module).map(k => module[k]);

    let names = [];
    modules.forEach(objectToCreate => {
      let objName = objectToCreate.__name;
      let modulePath = path.join(rootDir, objName);
      let objPath = path.join(modulePath, objName + ".js");
      let schemaPath = path.join(modulePath, "schema.js");
      let resolverPath = path.join(modulePath, "resolver.js");

      names.push(objName);
      let fields = objectToCreate.fields;

      let types = new Set([]);
      Object.keys(fields).forEach(k => {
        let packet = fields[k];
        if (packet.__isArray || packet.__isObject) {
          types.add(packet.type.__name);
        }
      });

      let imports = types.size ? [...types].map(n => `import ${n} from "../${n}/${n}";`).join("\n") + "\n\n" : "";

      createFile(
        objPath,
        createObject(imports + "export default {", [
          {
            name: "table",
            value: objectToCreate.table
          },
          {
            name: "fields",
            value: Object.keys(fields).map(k => {
              let entry = fields[k];
              if (entry === DateType || (typeof entry === "object" && entry.__isDate)) {
                return {
                  name: k,
                  value: createObject(
                    "{",
                    [
                      {
                        name: "__isDate",
                        value: true,
                        literal: true
                      },
                      {
                        name: "format",
                        value: entry.format || defaultDateFormat
                      }
                    ],
                    3
                  ),
                  literal: true
                };
              } else if (typeof entry === "object" && (entry.__isArray || entry.__isObject)) {
                return {
                  name: k,
                  value: createObject(
                    "{",
                    [
                      { name: entry.__isArray ? "__isArray" : "__isObject", value: true, literal: true },
                      { name: "type", value: entry.type.__name, literal: true }
                    ],
                    3
                  ),
                  literal: true
                };
              } else {
                return {
                  name: k,
                  value: fields[k]
                };
              }
            })
          }
        ]) + ";",
        true,
        modulePath
      );

      createFile(schemaPath, createGraphqlSchema(objectToCreate), true);
      createFile(resolverPath, createGraphqlResolver(objectToCreate), true);
    });

    let schemaImports = names.map(n => `import { query as ${n}Query, mutation as ${n}Mutation, type as ${n}Type } from './${n}/schema';`).join("\n");
    fs.writeFileSync(
      path.join(rootDir, "schema.js"),
      `${schemaImports}
    
export default \`
  ${names.map(n => "${" + n + "Type}").join("\n\n  ")}

  type Query {
    ${names.map(n => "${" + n + "Query}").join("\n\n    ")}
  }

  type Mutation {
    ${names.map(n => "${" + n + "Mutation}").join("\n\n    ")}
  }

\``
    );

    let resolverImports = names.map(n => `import ${n} from './${n}/resolver';`).join("\n"),
      resolverDestructurings = "const " + names.map(n => `{ Query: ${n}Query, Mutation: ${n}Mutation, ...${n}Rest } = ${n}`).join(";\nconst ") + ";";
    fs.writeFileSync(
      path.join(rootDir, "resolver.js"),
      `${resolverImports}\n\n${resolverDestructurings}
    
export default {
  Query: Object.assign({},
    ${names.map(n => `${n}Query`).join(",\n    ")}
  ),
  Mutation: Object.assign({},
    ${names.map(n => `${n}Mutation`).join(",\n    ")}
  ),
  ${names.map(n => `...${n}Rest`).join(",\n  ")}
};
  
`
    );
  });
}
