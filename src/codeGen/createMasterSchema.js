import globalSchemaTypes from "./globalSchemaTypes";

export default function createMasterSchema(names, namesWithTables, namesWithoutTables, writeableNames, schemaAdditions) {
  let schemaImports = namesWithTables
    .map(n => `import { query as ${n}Query, mutation as ${n}Mutation, type as ${n}Type } from './${n}/schema';`)
    .concat(namesWithoutTables.map(n => `import { type as ${n}Type } from './${n}/schema';`))
    .join("\n");

  return `${schemaImports}
    
export default \`
${globalSchemaTypes}

  ${names.map(n => "${" + n + "Type}").join("\n\n  ")}

  type Query {
    ${namesWithTables.map(n => "${" + n + "Query}").join("\n\n    ")}
  }

  ${
    writeableNames.length
      ? `type Mutation {
    ${writeableNames.map(n => "${" + n + "Mutation}").join("\n\n    ")}
  }`
      : ""
  }

  ${schemaAdditions.join("\n\n")}

\``;
}
