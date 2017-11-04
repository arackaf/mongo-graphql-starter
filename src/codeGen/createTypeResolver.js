import fs from "fs";
import path from "path";

export default function createGraphqlResolver(objectToCreate) {
  let template = fs.readFileSync(path.resolve(__dirname, "./resolverTemplate.js"), { encoding: "utf8" });
  let projectIdsTemplate = fs.readFileSync(path.resolve(__dirname, "./projectIdsTemplate.js"), { encoding: "utf8" });
  let result = `import { middleware, preprocessor, queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities
  
import { ObjectId } from "mongodb";
import ${objectToCreate.__name} from "./${objectToCreate.__name}";
`;

  if (objectToCreate.relationships) {
    Object.keys(objectToCreate.relationships).forEach(relationshipName => {
      let relationship = objectToCreate.relationships[relationshipName];

      result += projectIdsTemplate
        .replace(/\${table}/g, relationship.type.table)
        .replace(/\${fkField}/g, relationship.fkField)
        .replace(/\${targetObjName}/g, relationshipName)
        .replace(/\${targetTypeName}/g, relationship.type.__name)
        .replace(/\${sourceParam}/g, objectToCreate.__name.toLowerCase())
        .replace(/\${sourceObjName}/g, objectToCreate.__name);
    });
  }

  result += template.replace(/\${table}/g, objectToCreate.table).replace(/\${objName}/g, objectToCreate.__name);
  return result;
}
