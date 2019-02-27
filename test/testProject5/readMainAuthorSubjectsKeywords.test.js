import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  let dev = { keywordName: "Development" };
  let military = { keywordName: "Air Force" };
  let reading = { keywordName: "Reading" };

  await Promise.all([dev, military, reading].map(subject => db.collection("keywords").insertOne(subject)));

  let js = { name: "JavaScript", keywordIds: [dev._id] };
  let af = { name: "Air Force", keywordIds: [military._id] };
  let lit = { name: "Literature", keywordIds: [reading._id] };

  await Promise.all([js, af, lit].map(subject => db.collection("subjects").insertOne(subject)));

  let adam = { name: "Adam", birthday: new Date("1982-03-22"), subjectIds: [js._id] };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19"), subjectIds: [af._id] };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02"), subjectIds: [lit._id] };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  await db.collection("books").insertOne({ title: "Book 1", pages: 100, mainAuthorId: adam._id });
  await db.collection("books").insertOne({ title: "Book 2", pages: 150, mainAuthorId: adam._id });
  await db.collection("books").insertOne({ title: "Book 3", pages: 200, mainAuthorId: mallory._id });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  await db.collection("keywords").deleteMany({});
  close();
  db = null;
});

test("Read authors with subjects", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, mainAuthor{name, subjects{name, keywords{keywordName}}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", mainAuthor: { name: "Adam", subjects: [{ name: "JavaScript", keywords: [{ keywordName: "Development" }] }] } },
      { title: "Book 2", mainAuthor: { name: "Adam", subjects: [{ name: "JavaScript", keywords: [{ keywordName: "Development" }] }] } },
      { title: "Book 3", mainAuthor: { name: "Mallory", subjects: [{ name: "Literature", keywords: [{ keywordName: "Reading" }] }] } }
    ]
  });
});
