import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  let js = { name: "JavaScript" };
  let af = { name: "Air Force" };
  let lit = { name: "Literature" };

  await Promise.all([js, af, lit].map(subject => db.collection("subjects").insertOne(subject)));

  let adam = { name: "Adam", birthday: new Date("1982-03-22"), subjectIds: ["" + js._id] };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19"), subjectIds: ["" + af._id] };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02"), subjectIds: ["" + lit._id] };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  await db.collection("books").insertOne({ title: "Book 1", pages: 100, authorIds: ["" + adam._id] });
  await db.collection("books").insertOne({ title: "Book 2", pages: 150, authorIds: ["" + adam._id] });
  await db.collection("books").insertOne({ title: "Book 3", pages: 200, authorIds: ["" + mallory._id] });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  close();
  db = null;
});

test("Read authors with subjects", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, authors{name, subjects{name}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 2", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 3", authors: [{ name: "Mallory", subjects: [{ name: "Literature" }] }] }
    ]
  });
});

test("Read authors with subjects -- using fragments 1", async () => {
  await queryAndMatchArray({
    query: `
      fragment d1 on Book {
        title
      }
      fragment d2 on Book {
        authors {
          name
          subjects { name }
        }
      }

      query {allBooks(title_startsWith: "B"){Books{...d1, ...d2}}}
    `,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 2", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 3", authors: [{ name: "Mallory", subjects: [{ name: "Literature" }] }] }
    ]
  });
});

test("Read authors with subjects -- using fragments 2", async () => {
  await queryAndMatchArray({
    query: `
      fragment d1 on Book {
        title
      }
      fragment d2 on Author {
        name
        subjects { name }
      }

      query {allBooks(title_startsWith: "B"){Books{...d1, authors{ ...d2 } }}}
    `,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 2", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 3", authors: [{ name: "Mallory", subjects: [{ name: "Literature" }] }] }
    ]
  });
});

test("Read authors with subjects -- using fragments 2 A", async () => {
  await queryAndMatchArray({
    query: `
      fragment d1 on Book {
        title
      }
      fragment d2 on Author {
        name
        subjects(PREFER_LOOKUP: true) { name }
      }

      query {allBooks(title_startsWith: "B"){Books{...d1, authors(PREFER_LOOKUP: true) { ...d2 } }}}
    `,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 2", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 3", authors: [{ name: "Mallory", subjects: [{ name: "Literature" }] }] }
    ]
  });
});

test("Read authors with subjects -- using fragments 3", async () => {
  await queryAndMatchArray({
    query: `
      fragment d1 on Book {
        title
      }
      fragment d2 on Author {
        name
        subjects { ...d3 }
      }
      fragment d3 on Subject {
        name
      }

      query {allBooks(title_startsWith: "B"){Books{...d1, authors{ ...d2 } }}}
    `,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 2", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 3", authors: [{ name: "Mallory", subjects: [{ name: "Literature" }] }] }
    ]
  });
});

test("Read authors with subjects -- using fragments 3 A", async () => {
  await queryAndMatchArray({
    query: `
      fragment d1 on Book {
        title
      }
      fragment d2 on Author {
        name
        subjects(PREFER_LOOKUP: true) { ...d3 }
      }
      fragment d3 on Subject {
        name
      }

      query {allBooks(title_startsWith: "B"){Books{...d1, authors(PREFER_LOOKUP: true){ ...d2 } }}}
    `,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 2", authors: [{ name: "Adam", subjects: [{ name: "JavaScript" }] }] },
      { title: "Book 3", authors: [{ name: "Mallory", subjects: [{ name: "Literature" }] }] }
    ]
  });
});
