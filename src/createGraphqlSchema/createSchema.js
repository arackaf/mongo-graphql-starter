import path from "path";
import fs from "fs";

import { createObject, createGraphqlSchema, createGraphqlResolver } from "./createCode";

import { MongoId, String, Int, Float, arrayOf, Date } from "./dataTypes";

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
    Object.keys(module).forEach(k => (module[k].__name = k));
    let modules = Object.keys(module).map(k => module[k]);

    let names = [];
    modules.forEach(objectToCreate => {
      let objName = objectToCreate.__name,
        modulePath = path.join(rootDir, objName),
        objPath = path.join(modulePath, objName + ".js"),
        schemaPath = path.join(modulePath, "schema.js"),
        resolverPath = path.join(modulePath, "resolver.js");

      names.push(objName);
      let fields = objectToCreate.fields;

      createFile(
        objPath,
        createObject("export default {", [
          {
            name: "table",
            value: objectToCreate.table
          },
          {
            name: "fields",
            value: Object.keys(fields).map(k => {
              let entry = fields[k];
              if (entry === Date || (typeof entry === "object" && entry.__isDate)) {
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

    let schemaImports = names.map(n => `import { query as ${n}Query, type as ${n}Type } from './${n}/schema';`).join("\n");
    fs.writeFileSync(
      path.join(rootDir, "schema.js"),
      `${schemaImports}
    
export default \`
  ${names.map(n => "${" + n + "Type}").join("\n\n  ")}

  type Query {
    ${names.map(n => "${" + n + "Query}").join("\n\n    ")}
  }
\``
    );

    let resolverImports = names.map(n => `import ${n} from './${n}/resolver';`).join("\n"),
      resolverDestructurings = "let " + names.map(n => `{ ${n}Query, ...${n}Rest } = ${n}`).join(",\n  ") + ";";
    fs.writeFileSync(
      path.join(rootDir, "resolver.js"),
      `${resolverImports}\n\n${resolverDestructurings}
    
export default {
  Query: Object.assign({},
    ${names.map(n => `${n}Query`).join(",\n    ")}
  ),
  ${names.map(n => `...${n}Rest`).join(",\n  ")}
};
  
`
    );
  });
}
