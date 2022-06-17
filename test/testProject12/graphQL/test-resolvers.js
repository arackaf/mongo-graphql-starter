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
    `{allThing1s(LIMIT:1){Thing1s{_id q__id q__id_arr q_str q_strArr q_bool q_int q_intArr q_float q_floatArr q_date q_json nq__id nq__id_arr nq_str nq_strArr nq_bool nq_int nq_intArr nq_float nq_floatArr nq_date nq_json}}}`,
    "Thing1",
    "_id q__id q__id_arr q_str q_strArr q_bool q_int q_intArr q_float q_floatArr q_date q_json nq__id nq__id_arr nq_str nq_strArr nq_bool nq_int nq_intArr nq_float nq_floatArr nq_date nq_json"
  ).catch(error => console.error(error));

  // await processQuery(`mutation:{Thing1("_id q__id q__id_arr q_str q_strArr q_bool q_int q_intArr q_float q_floatArr q_date q_json nq__id nq__id_arr nq_str nq_strArr nq_bool nq_int nq_intArr nq_float nq_floatArr nq_date nq_json")}`," mutation Thing1", "")
  // .catch((error) => console.error(error))
};
runQueries().catch(error => console.error(error));
