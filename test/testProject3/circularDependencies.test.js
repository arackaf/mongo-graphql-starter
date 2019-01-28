import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("tags").deleteMany({});
  close();
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
