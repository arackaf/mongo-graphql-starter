import { GraphQLClient } from "graphql-request";
const endpoint = process.env.GRAPHQL_URL;
const token = process.env.AUTH_TOKEN;

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${token}`
  }
});
async function processQuery(query, name, fields, variables = {}) {
  return new Promise(async (resolve, reject) => {
    console.log(`doing ${name}`);
    const { data, errors, extensions, headers, status } = await graphQLClient.rawRequest(query);
    if (status === 200) {
      console.log(name + "passed");
      console.table(data);
      resolve(name);
    } else {
      console.error(JSON.stringify({ fields, name, errors, extensions, headers, status }));
      reject(errors);
    }
  });
}
const runQueries = async () => {
  await processQuery(
    `{allBooks(LIMIT:1){Books{_id title pages weight keywords editions prices isRead mongoId mongoIds authors {name,birthday,strings} primaryAuthor {name,birthday,strings} strArrs createdOn createdOnYearOnly jsonContent nq__id nq_str nq_strArr nq_bool nq_int nq_intArr nq_float nq_floatArr nq_date nq_json}}}`,
    "Book",
    "_id title pages weight keywords editions prices isRead mongoId mongoIds authors {name,birthday,strings} primaryAuthor {name,birthday,strings} strArrs createdOn createdOnYearOnly jsonContent nq__id nq_str nq_strArr nq_bool nq_int nq_intArr nq_float nq_floatArr nq_date nq_json"
  ).catch(error => console.error(error));
  await processQuery(`{allSubjects(LIMIT:1){Subjects{_id name}}}`, "Subject", "_id name").catch(error =>
    console.error(error)
  );
  await processQuery(`{allTags(LIMIT:1){Tags{_id name count}}}`, "Tag", "_id name count").catch(error =>
    console.error(error)
  );
  await processQuery(`{allReadonlyTags(LIMIT:1){ReadonlyTags{_id name count}}}`, "ReadonlyTag", "_id name count").catch(
    error => console.error(error)
  );

  // await processQuery(`mutation:{Book("_id title pages weight keywords editions prices isRead mongoId mongoIds authors {name,birthday,strings} primaryAuthor {name,birthday,strings} strArrs createdOn createdOnYearOnly jsonContent nq__id nq_str nq_strArr nq_bool nq_int nq_intArr nq_float nq_floatArr nq_date nq_json")}`," mutation Book", "").catch((error) => console.error(error))
  // await processQuery(`mutation:{Subject("_id name")}`," mutation Subject", "").catch((error) => console.error(error))
  // await processQuery(`mutation:{Tag("_id name count")}`," mutation Tag", "")
  // .catch((error) => console.error(error))
};
runQueries().catch(error => console.error(error));
