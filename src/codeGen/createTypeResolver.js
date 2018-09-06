import fs from "fs";
import path from "path";
import { TAB, TAB2 } from "./utilities";
import { MongoIdType } from "../dataTypes";

export default function createGraphqlResolver(objectToCreate) {
  let template = fs.readFileSync(path.resolve(__dirname, "./resolverTemplate.txt"), { encoding: "utf8" });
  let projectIdResolverTemplate = fs.readFileSync(path.resolve(__dirname, "./projectIdResolverTemplate.txt"), { encoding: "utf8" });
  let projectIdsResolverTemplate = fs.readFileSync(path.resolve(__dirname, "./projectIdsResolverTemplate.txt"), { encoding: "utf8" });

  let getItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/getItem.txt"), { encoding: "utf8" });
  let allItemsTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/allItems.txt"), { encoding: "utf8" });
  let createItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/createItem.txt"), { encoding: "utf8" });
  let updateItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/updateItem.txt"), { encoding: "utf8" });
  let updateItemsTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/updateItems.txt"), { encoding: "utf8" });
  let updateItemsBulkTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/updateItemsBulk.txt"), { encoding: "utf8" });
  let deleteItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/deleteItem.txt"), { encoding: "utf8" });

  let result = "";
  let extras = objectToCreate.extras || {};
  let overrides = new Set(extras.overrides || []);
  let resolverSources = extras.resolverSources || [];
  let imports = [
    `import { queryUtilities, processHook, dbHelpers } from "mongo-graphql-starter";`,
    `import hooksObj from "../hooks";`,
    `const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject, constants } = queryUtilities;`,
    `import { ObjectId } from "mongodb";`,
    `import ${objectToCreate.__name}Metadata from "./${objectToCreate.__name}";`,
    ...resolverSources.map(
      (src, i) =>
        `import ResolverExtras${i + 1} from "${src}";\nconst { Query: QueryExtras${i + 1}, Mutation: MutationExtras${i + 1}, ...OtherExtras${i +
          1} } = ResolverExtras${i + 1};`
    )
  ];

  let queryItems = [
    !overrides.has(`get${objectToCreate.__name}`) ? getItemTemplate : "",
    !overrides.has(`all${objectToCreate.__name}s`) ? allItemsTemplate : "",
    resolverSources.map((src, i) => `${TAB2}...(QueryExtras${i + 1} || {})`).join(",\n")
  ]
    .filter(s => s)
    .join(",\n");

  let typeExtras = resolverSources.map((src, i) => `${TAB2}...(OtherExtras${i + 1} || {})`).join(",\n");

  let mutationItems = [
    !overrides.has(`create${objectToCreate.__name}`) ? createItemTemplate : "",
    !overrides.has(`update${objectToCreate.__name}`) ? updateItemTemplate : "",
    !overrides.has(`update${objectToCreate.__name}s`) ? updateItemsTemplate : "",
    !overrides.has(`update${objectToCreate.__name}sBulk`) ? updateItemsBulkTemplate : "",
    !overrides.has(`delete${objectToCreate.__name}`) ? deleteItemTemplate : "",
    resolverSources.map((src, i) => `${TAB2}...(MutationExtras${i + 1} || {})`).join(",\n")
  ]
    .filter(s => s)
    .join(",\n");

  let typeImports = new Set([]);
  let relationshipResolvers = "";

  if (objectToCreate.relationships) {
    Object.keys(objectToCreate.relationships).forEach((relationshipName, index, all) => {
      let relationship = objectToCreate.relationships[relationshipName];

      if (!typeImports.has(relationship.type.__name)) {
        typeImports.add(relationship.type.__name);
        imports.push(`import { load${relationship.type.__name}s} from "../${relationship.type.__name}/resolver";`);
        imports.push(`import ${relationship.type.__name}Metadata from "../${relationship.type.__name}/${relationship.type.__name}";`);
      }

      if (!typeImports.has("flatMap")) {
        typeImports.add("flatMap");
        imports.push(`import flatMap from "lodash.flatmap";`);
      }

      if (!typeImports.has("dataloader")) {
        typeImports.add("dataloader");
        imports.push(`import DataLoader from "dataloader";`);
      }

      if (relationship.__isArray) {
        relationshipResolvers += projectIdsResolverTemplate
          .replace(/\${table}/g, relationship.type.table)
          .replace(/\${fkField}/g, relationship.fkField)
          .replace(/\${keyField}/g, relationship.keyField || "_id")
          .replace(
            /\${idMapping}/g,
            relationship.type.fields[relationship.keyField || "_id"] === MongoIdType ? "ids => ids.map(id => ObjectId(id))" : "ids => ids"
          )
          .replace(/\${targetObjName}/g, relationshipName)
          .replace(/\${targetTypeName}/g, relationship.type.__name)
          .replace(/\${targetTypeNameLower}/g, relationship.type.__name.toLowerCase())
          .replace(/\${sourceParam}/g, objectToCreate.__name.toLowerCase())
          .replace(/\${sourceObjName}/g, objectToCreate.__name)
          .replace(/\${dataLoaderId}/g, `__${objectToCreate.__name}_${relationshipName}DataLoader`);
      } else if (relationship.__isObject) {
        relationshipResolvers += projectIdResolverTemplate
          .replace(/\${table}/g, relationship.type.table)
          .replace(/\${fkField}/g, relationship.fkField)
          .replace(/\${targetObjName}/g, relationshipName)
          .replace(/\${targetTypeName}/g, relationship.type.__name)
          .replace(/\${targetTypeNameLower}/g, relationship.type.__name.toLowerCase())
          .replace(/\${sourceParam}/g, objectToCreate.__name.toLowerCase())
          .replace(/\${sourceObjName}/g, objectToCreate.__name)
          .replace(/\${dataLoaderId}/g, `__${objectToCreate.__name}_${relationshipName}DataLoader`);
      }

      if (index < all.length - 1) {
        relationshipResolvers += ",\n";
      }
    });
  }

  result += template
    .replace(/\${queryItems}/g, queryItems)
    .replace(/\${typeExtras}/g, typeExtras)
    .replace(/\${mutationItems}/g, mutationItems)
    .replace(/\${relationshipResolvers}/g, relationshipResolvers)
    .replace(/\${table}/g, objectToCreate.table)
    .replace(/\${objName}/g, objectToCreate.__name)
    .replace(/\${objNameLower}/g, objectToCreate.__name.toLowerCase());

  return `
${imports.join("\n")}

${result}`.trim();
}
