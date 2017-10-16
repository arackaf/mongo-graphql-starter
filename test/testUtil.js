import { MongoClient } from "mongodb";
import { graphql } from "graphql";

export async function queryAndMatchArray({ schema, db, query, variables, coll, results }) {
  let allResults = await graphql(schema, query, { db });
  if (!allResults.data || !allResults.data[coll]) {
    let msg = "Expected result not found: probable error.";
    if (allResults.errors) {
      msg += "\n\n" + allResults.errors.map(err => err.message).join("\n\n");
    }
    throw msg;
  }
  let arr = allResults.data[coll];

  expect(arr).toEqual(results);
}
