export default function createMasterSchema(names, namesWithTables, namesWithoutTables) {
  let schemaImports = namesWithTables
    .map(n => `import { query as ${n}Query, mutation as ${n}Mutation, type as ${n}Type } from './${n}/schema';`)
    .concat(namesWithoutTables.map(n => `import { type as ${n}Type } from './${n}/schema';`))
    .join("\n");

  return `${schemaImports}
    
export default \`
  scalar JSON

  type DeletionResultInfo {
    success: Boolean,
    Meta: MutationResultInfo
  }

  type MutationResultInfo {
    transaction: Boolean,
    elapsedTime: Int
  }

  type QueryResultsMetadata {
    count: Int
  }

  input StringArrayUpdate {
    index: Int,
    value: String
  }

  input IntArrayUpdate {
    index: Int,
    value: Int
  }

  input FloatArrayUpdate {
    index: Int,
    value: Float
  }

  ${names.map(n => "${" + n + "Type}").join("\n\n  ")}

  type Query {
    ${namesWithTables.map(n => "${" + n + "Query}").join("\n\n    ")}
  }

  type Mutation {
    ${namesWithTables.map(n => "${" + n + "Mutation}").join("\n\n    ")}
  }

\``;
}
