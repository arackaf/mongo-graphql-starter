import { MongoClient } from "mongodb";
import { graphql } from "graphql";

export async function queryAndMatchArray({ schema, db, query, variables, coll, results }) {
  let allResult = await graphql(schema, query, { db });
  let { data: { [coll]: arr } } = await graphql(schema, query, { db });

  expect(arr).toEqual(results);
}
