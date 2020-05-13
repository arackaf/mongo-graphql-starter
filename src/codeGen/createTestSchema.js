import globalSchemaTypes from "./globalSchemaTypes";

export default function createTestSchema(names, namesWithTables, namesWithoutTables, writeableNames, types) {
  let schemaImports = namesWithTables
    .map((n) => `import { query as ${n}Query, mutation as ${n}Mutation, type as ${n}Type } from './${n}/schema';`)
    .concat(namesWithoutTables.map((n) => `import { type as ${n}Type } from './${n}/schema';`))
    .join("\n");
  // console.log({types})
  return `
  import { rawRequest } from "graphql-request"
  const endpoint = "http://localhost:8080/graphql"

  async function processQuery(query,name,fields) {
    const { data, errors, extensions, headers, status } = await rawRequest(
      endpoint,
      query
    )
    if(status===200){
      console.log(name+"passed")
    } else {

    
    console.error(
      JSON.stringify({ fields,name, errors, extensions, headers, status })
    )
    }
  }
const runQueries = async () => {
    ${namesWithTables
      .map((n) => {
        const a = types.filter((t) => t.__name === n);
        const fields = a[0].fields;
        const recursedFields = [];

        Object.keys(fields).forEach((k) => {
          if (fields[k].__isArray) {
            recursedFields.push(`${k}: {${Object.keys(fields[k].type.fields)}}`);
          } else {
            recursedFields.push(k);
          }
          switch (fields[k]) {
            default:
          }
        });

        console.table(recursedFields);
        const fieldNames = recursedFields.join(" ");
        return `processQuery(\`{get${n}{${n}{${fieldNames}}}}\`,"${n}", "${fieldNames}")`;
      })
      .join("\n")}
}
runQueries().catch((error) => console.error(error))
`;
}
