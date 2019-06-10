import path from "path";
import _globalSchemaTypes from "./globalSchemaTypes";
const globalSchemaTypes = _globalSchemaTypes.replace(/^  /gm, "");

import createTypeSchemaHelpers from "./typeSchemaHelpers";

export default function createMasterSchema(types, rootDir) {
  const typesWithTables = types.filter(t => t.table);

  const allPackets = typesWithTables.map(objectToCreate => {
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
      query: packet.createQueryType() + (extraQueries.length ? "\n" + extraQueries.join("\n") : ""),
      mutation: packet.createMutationType() + (extraMutations.length ? "\n" + extraMutations.join("\n") : "")
    };
  });

  return `
${globalSchemaTypes}

type Query {
${allPackets.map(p => p.query)}
}

type Mutation {
${allPackets.map(p => p.mutation)}
}

`.trim();
}
