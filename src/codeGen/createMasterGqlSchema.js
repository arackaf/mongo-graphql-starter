import _globalSchemaTypes from "./globalSchemaTypes";
const globalSchemaTypes = _globalSchemaTypes.replace(/^  /gm, "");

import createTypeSchemaHelpers from "./typeSchemaHelpers";

export default function createMasterSchema(types) {
  const typesWithTables = types.filter(t => t.table);
  const allPackets = typesWithTables.map(createTypeSchemaHelpers);

  return `
${globalSchemaTypes}

type Query {
${allPackets.map(p => p.createQueryType()).join("\n\n")}
}

type Mutation {
  
}

`.trim();
}
