import spinUp from "./spinUp";

const authorA = { name: "A 1", birthday: new Date("1982-03-22"), favoriteTag: { name: "T1", description: "Desc1" } };
const authorB = { name: "A 2", birthday: new Date("1982-06-15"), favoriteTag: { name: "T1", description: "Desc1" } };
const authorC = { name: "A 3", birthday: new Date("1982-07-04"), favoriteTag: { name: "T2", description: "Desc2" } };

const cauthorA = { name: "CA 1", birthday: new Date("1982-03-22"), favoriteTag: { name: "T1", description: "Desc1" } };
const cauthorB = { name: "CA 2", birthday: new Date("1982-06-15"), favoriteTag: { name: "T1", description: "Desc1" } };
const cauthorC = { name: "CA 3", birthday: new Date("1982-07-04"), favoriteTag: { name: "T2", description: "Desc2" } };

const comment1 = { text: "Comment 1", upVotes: 2, author: cauthorA };
const comment2 = { text: "Comment 2", upVotes: 4, author: cauthorB };
const comment3 = { text: "Comment 3", upVotes: 0, author: cauthorC };
const comment4 = { text: "Comment 4", upVotes: 9, author: cauthorA };
const comment5 = { text: "Comment 5", upVotes: 4, author: cauthorA };
const comment6 = { text: "Comment 6", upVotes: 4, author: cauthorA };
const comment7 = { text: "Comment 7", upVotes: 4, author: cauthorC };

let db, schema, queryAndMatchArray;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray } = await spinUp());
  await Promise.all([
    db.collection("blogs").insert({ title: "Blog 1", author: authorA, comments: [comment1, comment2, comment3] }),
    db.collection("blogs").insert({ title: "Blog 2", author: authorA, comments: [] }),
    db.collection("blogs").insert({ title: "Blog 3", author: authorB, comments: [comment4] }),
    db.collection("blogs").insert({ title: "Blog 4", author: authorC, comments: [comment5, comment6] }),
    db.collection("blogs").insert({ title: "Blog 5", author: authorC, comments: [comment7] })
  ]);
});

afterAll(async () => {
  await db.collection("blogs").remove({});
  db.close();
  db = null;
});

test("Deep querying 1", async () =>
  await runIt(`{allBlogs(author: {name: "A 1"}, SORT: {title: 1}){ title }}`, [{ title: "Blog 1" }, { title: "Blog 2" }]));

test("Deep querying 2", async () => await runIt(`{allBlogs(author: {name_endsWith: "2"}, SORT: {title: 1}){ title }}`, [{ title: "Blog 3" }]));
test("Deep querying 3", async () =>
  await runIt(`{allBlogs(author: {birthday_gt: "1982-07-03"}, SORT: {title: 1}){ title }}`, [{ title: "Blog 4" }, { title: "Blog 5" }]));
test("Deep querying 4", async () =>
  await runIt(`{allBlogs(author: {favoriteTag: { name: "T1" }}, SORT: {title: 1}){ title }}`, [
    { title: "Blog 1" },
    { title: "Blog 2" },
    { title: "Blog 3" }
  ]));

test("Deep querying 5", async () => await runIt(`{allBlogs(comments: {text: "Comment 6", upVotes: 4 }){ title }}`, [{ title: "Blog 4" }]));
test("Deep querying 6", async () =>
  await runIt(`{allBlogs(comments: {text: "Comment 6", author: { name: "CA 1" }}){ title }}`, [{ title: "Blog 4" }]));

test("Deep querying 7", async () =>
  await runIt(`{allBlogs(comments: {text_startsWith: "Comm", author: { name: "CA 1" }}, SORT: {title: 1}){ title }}`, [
    { title: "Blog 1" },
    { title: "Blog 3" },
    { title: "Blog 4" }
  ]));

test("Deep querying 8", async () =>
  await runIt(`{allBlogs(comments: { OR: [{text_endsWith: "6"}, {author: { name: "CA 3"}}] }, SORT: {title: 1}){ title }}`, [
    { title: "Blog 1" },
    { title: "Blog 4" },
    { title: "Blog 5" }
  ]));

test("Deep querying 9", async () =>
  await runIt(`{allBlogs(comments: {text_endsWith: "6", author: { name: "CA 3" }}, SORT: {title: 1}){ title }}`, []));

test("Deep querying 10", async () =>
  await runIt(`{allBlogs(comments: {upVotes: 4, author: { OR: [{ name: "CA 3" }, { favoriteTag: {name: "T1"} }]}}, SORT: {title: 1}){ title }}`, [
    { title: "Blog 1" },
    { title: "Blog 4" },
    { title: "Blog 5" }
  ]));
test("Deep querying 11", async () =>
  await runIt(
    `{allBlogs(comments: {upVotes: 4, OR: [{author: { name: "CA 3" } }, {author: { favoriteTag: {name: "T1"}}}]}, SORT: {title: 1}){ title }}`,
    [{ title: "Blog 1" }, { title: "Blog 4" }, { title: "Blog 5" }]
  ));
test("Deep querying 12", async () =>
  await runIt(`{allBlogs(comments: {upVotes: 4, author: { OR: [{ name: "XXX" }, { favoriteTag: {name: "T2"} }]}}, SORT: {title: 1}){ title }}`, [
    { title: "Blog 5" }
  ]));
test("Deep querying 13", async () =>
  await runIt(`{allBlogs(comments: {upVotes: 4, author: { OR: [{ name: "XXX" }, { favoriteTag: {name: "X"} }]}}, SORT: {title: 1}){ title }}`, []));

test("Deep querying 14", async () =>
  await runIt(`{allBlogs(comments: {author: { name: "CA 1", favoriteTag: {name: "T1"} }}, SORT: {title: 1}){ title }}`, [
    { title: "Blog 1" },
    { title: "Blog 3" },
    { title: "Blog 4" }
  ]));

async function runIt(query, results) {
  await queryAndMatchArray({
    query,
    coll: "allBlogs",
    results
  });
}
