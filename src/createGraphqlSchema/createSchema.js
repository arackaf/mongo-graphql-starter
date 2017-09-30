import path from "path";
import fs from "fs";

import { createObject, createGraphqlSchema, createGraphqlResolver } from "./createCode";

import { MongoId, String, Int, Float, ArrayOf } from "./dataTypes";

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

      if (!fs.existsSync(objPath)) {
        fs.mkdirSync(modulePath);

        fs.writeFileSync(
          objPath,
          createObject("export default {", [
            {
              name: "table",
              value: objectToCreate.table
            },
            {
              name: "fields",
              value: Object.keys(objectToCreate.fields).map(k => ({
                name: k,
                value: objectToCreate.fields[k]
              }))
            }
          ]) + ";"
        );

        fs.writeFileSync(schemaPath, createGraphqlSchema(objectToCreate));

        fs.writeFileSync(resolverPath, createGraphqlResolver(objectToCreate));
      }
    });

    let schemaImports = names.map(n => `import ${n} from './${n}/schema';`).join("\n");
    fs.writeFileSync(
      path.join(rootDir, "schema.js"),
      `${schemaImports}
    
export default \`
  ${names.map(n => "${" + n + "}").join("\n\n  ")}
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
