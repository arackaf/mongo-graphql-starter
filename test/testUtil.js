import { MongoClient } from "mongodb";
import { graphql } from "graphql";

let connectionUid = 1;
const localConn = "mongodb://127.0.0.1:27017/mongo-graphql-starter";

export const nextConnectionString = () => process.env.MongoAddr || localConn;

export async function runQuery({ schema, db, query, coll }) {
  let allResults = await graphql({ schema, source: query, rootValue: { db }, contextValue: {} });

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
  } else {
    return allResults.data[coll];
  }
}

export async function queryAndMatchArray({ schema, db, query, variables, coll, results, rawResult, meta, error }) {
  let allResults = await graphql({ schema, source: query, rootValue: { db }, contextValue: {} });

  if (error) {
    if (!allResults.errors || !allResults.errors.length) {
      throw "Expected an error but didn't get one";
    }
    return;
  }

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
  } else if (allResults.data && allResults.data[coll] == null && results != null) {
    let msg = "Null came back unexpectadly on filter";
    try {
      msg += "\n\n" + JSON.parse(allResults);
    } catch (e) {}

    console.log("\n\n", allResults, "\n\n");
    throw msg;
  }

  if (results != null) {
    let needsReplacing = !rawResult && (/^all/.test(coll) || /^get/.test(coll));
    let res = needsReplacing ? allResults.data[coll][coll.replace(/^all/, "").replace(/^get/, "")] : allResults.data[coll];

    expect(res).toEqual(results);
  }

  if (meta != null) {
    let metaResult = allResults.data[coll].Meta;
    expect(meta).toEqual(metaResult);
  }
}

export async function queriesWithoutError({ schema, db, query }) {
  let allResults = await graphql({ schema, source: query, rootValue: { db }, contextValue: {} });

  if (allResults.errors) {
    expect("Error was not expected").toBe("But Error'd out\n\n" + allResults.errors);
  } else {
    expect(1).toBe(1);
  }
}

export async function queryFails({ schema, db, query }) {
  let allResults = await graphql({ schema, source: query, rootValue: { db }, contextValue: {} });

  if (allResults.errors) {
    expect(1).toBe(1);
  } else {
    expect("Error was expected").toBe("But did not fail");
  }
}

export async function runMutation({ schema, db, client, mutation, variables, noValidation, result, rawResult, expectedError, prefix = "" }) {
  if (mutation == null) {
    throw "NO MUTATION PASSED IN";
  }

  let mutationResult = await graphql({ schema, source: `${prefix} mutation{${mutation}}`, rootValue: { db, client }, contextValue: {} });

  if (noValidation) {
    return;
  }

  if (rawResult) {
    return mutationResult.data[rawResult];
  }

  if (expectedError) {
    if (!mutationResult.errors) {
      throw "Expected error " + expectedError + " but got none";
    }
    if (!mutationResult.errors.find(e => expectedError.test(e))) {
      throw "Expected error " + expectedError + " but got " + mutationResult.errors.join("\n\n");
    }
    return;
  }

  if (mutationResult.errors) {
    throw "Failed with \n\n" + mutationResult.errors;
  }

  if (!(mutationResult.data && mutationResult.data[result] !== void 0)) {
    throw result + " not found on mutation result";
  }

  let needsReplacing = /^create/.test(result) || /^update/.test(result);
  if (needsReplacing) {
    return mutationResult.data[result][result.replace(/^create/, "").replace(/^update/, "")];
  }

  return mutationResult.data[result];
}
