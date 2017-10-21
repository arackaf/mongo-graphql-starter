import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray, runMutation } from "../testUtil";

import conn from "./connection";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect(conn);
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Circular dependencies work", async () => {
  let tag = await runMutation({ schema, db, mutation: `createTag(Tag: {tagName: "JavaScript"}){_id}`, result: "createTag" });
  let author = await runMutation({
    schema,
    db,
    mutation: `createAuthor(Author: { name: "Adam", tags: [{_id: "${tag._id}", tagName: "${tag.tagName}"}]}){_id, name}`,
    result: "createAuthor"
  });

  await runMutation({
    schema,
    db,
    mutation: `updateTag(_id: "${tag._id}", Tag: { authors: [{_id: "${author._id}", name: "${author.name}"}]}){_id}`,
    result: "updateTag"
  });

  await queryAndMatchArray({
    schema,
    db,
    query: `{getTag(_id: "${tag._id}"){tagName, authors{ _id, name }}}`,
    coll: "getTag",
    results: { tagName: "JavaScript", authors: [{ _id: author._id, name: "Adam" }] }
  });
});
