import { MongoClient } from "mongodb";
import { graphql } from "graphql";

let connectionUid = 1;
const localConn = "mongodb://localhost:27017/mongo-graphql-starter";

export const nextConnectionString = () => localConn + "-" + connectionUid++;

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

    console.log("\n\n", allResults, "\n\n");
    throw msg;
  }

  let res = /^all/.test(coll) ? allResults.data[coll][coll.replace(/^all/, "")] : allResults.data[coll];

  expect(res).toEqual(results);
}

export async function runMutation({ schema, db, mutation, variables, result }) {
  let mutationResult = await graphql(schema, `mutation{${mutation}}`, { db });

  if (mutationResult.errors) {
    throw "Failed with \n\n" + mutationResult.errors;
  }

  if (mutationResult.data && mutationResult.data[result]) {
    return mutationResult.data[result];
  } else {
    throw result + " not found on mutation result";
  }
}
