import globalSchemaTypes from "./globalSchemaTypes";

export default function createTestSchema(names, namesWithTables, namesWithoutTables, writeableNames, types) {
  let schemaImports = namesWithTables
    .map(n => `import { query as ${n}Query, mutation as ${n}Mutation, type as ${n}Type } from './${n}/schema';`)
    .concat(namesWithoutTables.map(n => `import { type as ${n}Type } from './${n}/schema';`))
    .join("\n");
  // console.log({types})
  return `
  import { GraphQLClient } from "graphql-request"
  const endpoint = process.env.GRAPHQL_URL
  const token = process.env.AUTH_TOKEN
  
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: \`Bearer \${token}\`
    }
  })
  async function processQuery(query, name, fields, variables = {}) {
    return new Promise(async (resolve, reject) => {
      console.log(\`doing \${name}\`)
      const {
        data,
        errors,
        extensions,
        headers,
        status
      } = await graphQLClient.rawRequest(query)
      if (status === 200) {
        console.log(name + "passed")
        console.table(data)
        resolve(name)
      } else {
        console.error(
          JSON.stringify({ fields, name, errors, extensions, headers, status })
        )
        reject(errors)
      }
    })
  }
  const runQueries = async () => {
    ${namesWithTables
      .map(n => {
        const a = types.filter(t => t.__name === n);

        const fields = a[0].fields;
        const recursedFields = [];
        const manualQueryArgs = [];
        Object.keys(fields).forEach(k => {
          if (fields[k].__isArray || fields[k].__isObject) {
            recursedFields.push(`${k} {${Object.keys(fields[k].type.fields)}}`);
          } else {
            recursedFields.push(k);
          }
          switch (fields[k]) {
            default:
          }
          if (Array.isArray(fields[k].manualQueryArgs)) {
            manualQueryArgs.push(...fields[k].manualQueryArgs.map(arg => `${arg.name}: ${arg.type}`));
          }
        });

        const fieldNames = recursedFields.join(" ");
        return `await processQuery(\`{all${n}s(LIMIT:1){${n}s{${fieldNames}}}}\`,"${n}", "${fieldNames}")`;
      })
      .join(".catch((error) => console.error(error))\n")}
      ${namesWithTables.length > 0 ? `.catch((error) => console.error(error))` : ""}
  ${
    writeableNames.length
      ? `
    ${writeableNames
      .map(n => {
        const a = types.filter(t => t.__name === n);

        const fields = a[0].fields;
        const recursedFields = [];
        const manualQueryArgs = [];
        Object.keys(fields).forEach(k => {
          if (fields[k].__isArray || fields[k].__isObject) {
            recursedFields.push(`${k} {${Object.keys(fields[k].type.fields)}}`);
          } else {
            recursedFields.push(k);
          }
          switch (fields[k]) {
            default:
          }
          if (Array.isArray(fields[k].manualQueryArgs)) {
            manualQueryArgs.push(...fields[k].manualQueryArgs.map(arg => `${arg.name}: ${arg.type}`));
          }
        });

        const fieldNames = recursedFields.join(" ");

        return `// await processQuery(\`mutation:{${n}(${JSON.stringify(fieldNames)})}\`," mutation ${n}", "")`;
      })
      .join(".catch((error) => console.error(error))\n")}
      // .catch((error) => console.error(error))
  `
      : ""
  }
}
runQueries().catch((error) => console.error(error))
`;
}
