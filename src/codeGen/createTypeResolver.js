import fs from "fs";
import path from "path";

export default function createGraphqlResolver(objectToCreate) {
  let template = fs.readFileSync(path.resolve(__dirname, "./resolverTemplate.js"), { encoding: "utf8" });
  let projectIdsTemplate = fs.readFileSync(path.resolve(__dirname, "./projectIdsTemplate.js"), { encoding: "utf8" });
  let projectIdTemplate = fs.readFileSync(path.resolve(__dirname, "./projectIdTemplate.js"), { encoding: "utf8" });
  let result = "";
  let imports = [
    `import { queryUtilities, processHook } from "mongo-graphql-starter";`,
    `import hooksObj from "../hooks"`,
    `const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;`,
    `import { ObjectId } from "mongodb";`,
    `import ${objectToCreate.__name} from "./${objectToCreate.__name}";`
  ];
  let typeImports = new Set([]);
  let relationships = "";

  if (objectToCreate.relationships) {
    Object.keys(objectToCreate.relationships).forEach((relationshipName, index, all) => {
      let relationship = objectToCreate.relationships[relationshipName];

      if (!typeImports.has(relationship.type.__name)) {
        typeImports.add(relationship.type.__name);
        imports.push(`import { load${relationship.type.__name}s} from "../${relationship.type.__name}/resolver";`);
      }

      if (!typeImports.has("flatMap")) {
        typeImports.add("flatMap");
        imports.push(`import flatMap from "lodash.flatmap";`);
      }

      if (relationship.__isArray) {
        relationships += projectIdsTemplate
          .replace(/\${table}/g, relationship.type.table)
          .replace(/\${fkField}/g, relationship.fkField)
          .replace(/\${targetObjName}/g, relationshipName)
          .replace(/\${targetTypeName}/g, relationship.type.__name)
          .replace(/\${targetTypeNameLower}/g, relationship.type.__name.toLowerCase())
          .replace(/\${sourceParam}/g, objectToCreate.__name.toLowerCase())
          .replace(/\${sourceObjName}/g, objectToCreate.__name);
      } else if (relationship.__isObject) {
        relationships += projectIdTemplate
          .replace(/\${table}/g, relationship.type.table)
          .replace(/\${fkField}/g, relationship.fkField)
          .replace(/\${targetObjName}/g, relationshipName)
          .replace(/\${targetTypeName}/g, relationship.type.__name)
          .replace(/\${targetTypeNameLower}/g, relationship.type.__name.toLowerCase())
          .replace(/\${sourceParam}/g, objectToCreate.__name.toLowerCase())
          .replace(/\${sourceObjName}/g, objectToCreate.__name);
      }

      if (index < all.length - 1) {
        relationships += "\n\n";
      }
    });

    relationships = "\n" + relationships + "\n";
  }

  result += template
    .replace(/\${relationships}/g, relationships)
    .replace(/\${table}/g, objectToCreate.table)
    .replace(/\${objName}/g, objectToCreate.__name)
    .replace(/\${objNameLower}/g, objectToCreate.__name.toLowerCase());

  return `
${imports.join("\n")}

${result}`.trim();
}
