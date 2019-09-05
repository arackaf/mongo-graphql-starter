import path from "path";
import _globalSchemaTypes from "./globalSchemaTypes";
const globalSchemaTypes = _globalSchemaTypes.replace(/^  /gm, "");

import createTypeSchemaHelpers from "./typeSchemaHelpers";

export default function createMasterGqlSchema(types, rootDir) {
  const typesWithTables = types.filter(t => t.table);
  const typesWithoutTables = types.filter(t => !t.table);

  const tablelessTypePackets = typesWithoutTables.map(objectToCreate => {
    let packet = createTypeSchemaHelpers(objectToCreate);

    return {
      types: packet.createSchemaTypes()
    };
  });

  const tableTypePackets = typesWithTables.map(objectToCreate => {
    let packet = createTypeSchemaHelpers(objectToCreate);
    let objName = objectToCreate.__name;
    let modulePath = path.join(rootDir, objName);

    let extras = objectToCreate.extras || {};
    let schemaSources = extras.schemaSources || [];
    let extraQueries = [];
    let extraMutations = [];

    schemaSources.forEach(src => {
      let newPath = path.join(modulePath, src);
      let ext = path.extname(src);
      if (!ext) {
        newPath += ".js";
      }

      let esModule = require(newPath).default;
      esModule.Query && extraQueries.push(esModule.Query);
      esModule.Mutation && extraMutations.push(esModule.Mutation);
    });

    return {
      readonly: objectToCreate.readonly,
      types: packet.createSchemaTypes(),
      query: packet.createQueryType() + (extraQueries.length ? "\n" + extraQueries.join("\n") : ""),
      mutation: packet.createMutationType() + (extraMutations.length ? "\n" + extraMutations.join("\n") : "")
    };
  });

  return `
${globalSchemaTypes}

${tablelessTypePackets.map(p => p.types).join("\n\n")}

${tableTypePackets.map(p => p.types).join("\n\n")}

type Query {
${tableTypePackets.map(p => p.query).join("\n\n")}
}

${
  !tableTypePackets.find(t => t.readonly)
    ? `type Mutation {
${tableTypePackets
  .filter(t => !t.readonly)
  .map(p => p.mutation)
  .join("\n\n")}
}`
    : ""
}

`.trim();
}
