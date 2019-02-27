import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, runQuery, queryAndMatchArray, runMutation, close;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runQuery, runMutation, close } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  await db.collection("keywords").deleteMany({});
});

afterAll(async () => {
  close();
  db = null;
});

test("Add books entry in new author, and nested objects A", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });
  let b = await runMutation({
    mutation: `createAuthor(Author: { name: "bob" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${a._id}", "${b._id}"], Updates: {}, books_ADD: [
      {
        title: "New Book 1",
        mainAuthor: {
          name: "ma",
          mainSubject: { name: "ms" },
          subjects: [{ name: "s1" }, { name: "s2" }]
        }
      }
    ]){Authors{name}}`,
    result: "updateAuthors"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name_in: ["adam", "bob"], SORT: {name: 1}){Authors{name, books{title, mainAuthor {name, mainSubject{name}, subjects(SORT: {name: 1}){name}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        books: [{ title: "New Book 1", mainAuthor: { name: "ma", mainSubject: { name: "ms" }, subjects: [{ name: "s1" }, { name: "s2" }] } }]
      },
      {
        name: "bob",
        books: [{ title: "New Book 1", mainAuthor: { name: "ma", mainSubject: { name: "ms" }, subjects: [{ name: "s1" }, { name: "s2" }] } }]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }] //just one
  });
});

test("Add books entry in new author, and nested objects B", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });
  let b = await runMutation({
    mutation: `createAuthor(Author: { name: "bob" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${a._id}", "${b._id}"], Updates: {}, books_ADD: [
        {
          title: "New Book 1", 
          mainAuthor: { 
            name: "ma", 
            mainSubject: { name: "ms" }, 
            subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }] 
          }
        }
      ]){Authors{name}}`,
    result: "updateAuthors"
  });

  let booksResults = [
    {
      title: "New Book 1",
      mainAuthor: {
        name: "ma",
        mainSubject: { name: "ms" },
        subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
      }
    }
  ];

  await queryAndMatchArray({
    query: `{allAuthors(name_in: ["adam", "bob"], SORT: {name: 1}){Authors{name, books{title, mainAuthor {name, mainSubject{name}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        books: booksResults
      },
      {
        name: "bob",
        books: booksResults
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });
});

test("Add books entry in new author, and nested objects C", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });
  let b = await runMutation({
    mutation: `createAuthor(Author: { name: "bob" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${a._id}", "${b._id}"], Updates: {}, books_ADD: [
      {
        title: "New Book 1", 
        mainAuthor: { 
          name: "ma", 
          mainSubject: { name: "ms" }, 
          subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
          books: [{title: "Nested Book 1"}]
        } 
      }
    ]){Authors{name}}`,
    result: "updateAuthors"
  });

  let bookResults = [
    {
      title: "New Book 1",
      mainAuthor: {
        name: "ma",
        mainSubject: { name: "ms" },
        books: [{ title: "Nested Book 1" }],
        subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
      }
    }
  ];

  await queryAndMatchArray({
    query: `{allAuthors(name_in: ["adam", "bob"], SORT: {name: 1}){Authors{name, books{title, mainAuthor {name, mainSubject{name}, books{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        books: bookResults
      },
      {
        name: "bob",
        books: bookResults
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Nested Book 1" }, { title: "New Book 1" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });
});

test("Add books entry in new author, and nested objects D", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });
  let b = await runMutation({
    mutation: `createAuthor(Author: { name: "bob" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${a._id}", "${b._id}"], Updates: {}, books_ADD: [
      {
        title: "New Book 1",
        authors: [{name: "a1", books: [{title: "Nested Book A1"}]}],
        mainAuthor: { 
          name: "ma", 
          mainSubject: { name: "ms" }, 
          subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
          books: [{title: "Nested Book B"}]
        } 
      }
    ]){Authors{name}}`,
    result: "updateAuthors"
  });

  let bookResults = [
    {
      title: "New Book 1",
      authors: [
        { name: "a1", books: [{ title: "Nested Book A1" }, { title: "New Book 1" }] },
        { name: "adam", books: [{ title: "New Book 1" }] },
        { name: "bob", books: [{ title: "New Book 1" }] }
      ],
      mainAuthor: {
        name: "ma",
        mainSubject: { name: "ms" },
        books: [{ title: "Nested Book B" }],
        subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
      }
    }
  ];

  await queryAndMatchArray({
    query: `{allAuthors(name_in: ["adam", "bob"], SORT: {name: 1}){Authors{name, books{title, authors(SORT: {name: 1}){name, books(SORT: {title: 1}){title}}, mainAuthor {name, mainSubject{name}, books{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        books: bookResults
      },
      {
        name: "bob",
        books: bookResults
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Nested Book A1" }, { title: "Nested Book B" }, { title: "New Book 1" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });

  await queryAndMatchArray({
    query: `{allAuthors(SORT: {name: 1}){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "a1" }, { name: "adam" }, { name: "bob" }, { name: "ma" }]
  });
});

test("Add books entry in new author, and nested objects E", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "Adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });
  let b = await runMutation({
    mutation: `createAuthor(Author: { name: "Bob" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${a._id}", "${b._id}"], Updates: {}, books_ADD: [
      {
        title: "New Book 1",
        authors: [{name: "A1", books: [{title: "Nested Book A1", authors: [{name: "A2", books: [{title: "B1"}]}]}]}],
        mainAuthor: { 
          name: "MA", 
          mainSubject: { name: "ms" }, 
          subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
          books: [{title: "Nested Book B", authors: [{name: "A3", books: [{title: "B2"}]}] }]
        } 
      }
    ]){Authors{name}}`,
    result: "updateAuthors"
  });

  const A1_BOOKS = [{ title: "Nested Book A1" }, { title: "New Book 1" }];
  const A2_BOOKS = [{ title: "B1" }, { title: "Nested Book A1" }];
  const NEW_BOOK1_AUTHORS = [
    { name: "A1", books: A1_BOOKS },
    { name: "Adam", books: [{ title: "New Book 1" }] },
    { name: "Bob", books: [{ title: "New Book 1" }] }
  ];

  const bookResults = [
    {
      title: "New Book 1",
      authors: [
        {
          name: "A1",
          books: [
            {
              title: "Nested Book A1",
              authors: [{ name: "A1", books: A1_BOOKS }, { name: "A2", books: A2_BOOKS }]
            },
            {
              title: "New Book 1",
              authors: NEW_BOOK1_AUTHORS
            }
          ]
        },
        {
          name: "Adam",
          books: [
            {
              title: "New Book 1",
              authors: NEW_BOOK1_AUTHORS
            }
          ]
        },
        {
          name: "Bob",
          books: [
            {
              title: "New Book 1",
              authors: NEW_BOOK1_AUTHORS
            }
          ]
        }
      ],
      mainAuthor: {
        name: "MA",
        mainSubject: { name: "ms" },
        books: [
          {
            title: "Nested Book B",
            authors: [{ name: "A3", books: [{ title: "B2" }, { title: "Nested Book B" }] }, { name: "MA", books: [{ title: "Nested Book B" }] }]
          }
        ],
        subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
      }
    }
  ];

  await queryAndMatchArray({
    query: `{allAuthors(name_in: ["Adam", "Bob"], SORT: {name: 1}){Authors{name, books{title, authors(SORT: {name: 1}){name, books(SORT: {title: 1}){title, authors(SORT: {name: 1}){name, books(SORT: {title: 1}){title}}}}, mainAuthor {name, mainSubject{name}, books(SORT: {title: 1}){title, authors(SORT: {name: 1}){name, books(SORT: {title: 1}){title}}}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "Adam",
        books: bookResults
      },
      {
        name: "Bob",
        books: bookResults
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "B1" }, { title: "B2" }, { title: "Nested Book A1" }, { title: "Nested Book B" }, { title: "New Book 1" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });

  await queryAndMatchArray({
    query: `{allAuthors(SORT: {name: 1}){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "A1" }, { name: "A2" }, { name: "A3" }, { name: "Adam" }, { name: "Bob" }, { name: "MA" }]
  });
});
