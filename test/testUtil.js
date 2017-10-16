import { MongoClient } from "mongodb";
import { graphql } from "graphql";

export async function queryAndMatchArray({ schema, db, query, variables, coll, results }) {
  let allResults = await graphql(schema, query, { db });
  if (!allResults.data || allResults.data[coll] === void 0) {
    let msg = "Expected result not found: probable error.";
    if (allResults.errors) {
      msg += "\n\n" + allResults.errors.map(err => err.message).join("\n\n");
    } else {
      try {
        msg += JSON.stringify(allResults);
      } catch (err) {}
    }
    throw msg;
  } else if (allResults.data && allResults.data[coll] === null && results !== null) {
    let msg = "Null came back unexpectadly on filter";
    try {
      msg += "\n\n" + JSON.parse(allResults);
    } catch (e) {}
    throw msg;
  }
  let arr = allResults.data[coll];

  expect(arr).toEqual(results);
}
