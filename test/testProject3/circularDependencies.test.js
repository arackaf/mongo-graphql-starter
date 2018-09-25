import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());
});

afterAll(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  await db.collection("tags").remove({});
  db.close();
  db = null;
});

test("Circular dependencies work", async () => {
  let tag = await runMutation({ schema, db, mutation: `createTag(Tag: {tagName: "JavaScript"}){Tag{_id}}`, result: "createTag" });
  let author = await runMutation({
    mutation: `createAuthor(Author: { name: "Adam", tags: [{_id: "${tag._id}", tagName: "${tag.tagName}"}]}){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateTag(_id: "${tag._id}", Updates: { authors: [{_id: "${author._id}", name: "${author.name}"}]}){Tag{_id}}`,
    result: "updateTag"
  });

  await queryAndMatchArray({
    query: `{getTag(_id: "${tag._id}"){Tag{tagName, authors{ _id, name }}}}`,
    coll: "getTag",
    results: { tagName: "JavaScript", authors: [{ _id: author._id, name: "Adam" }] }
  });
});
