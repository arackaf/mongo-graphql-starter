let X = [
  {
    books: [
      {
        authors: [{ books: [{ title: "Nested Book A1" }], name: "a1" }],
        mainAuthor: {
          books: [{ title: "Nested Book B" }],
          mainSubject: { name: "ms" },
          name: "ma",
          subjects: [{ keywords: [], name: "s1" }, { keywords: [{ keywordName: "k1" }, { keywordName: "k2" }], name: "s2" }]
        },
        title: "New Book 1"
      }
    ],
    name: "adam"
  }
];

let Y = [
  {
    books: [
      {
        authors: [{ books: [{ title: "New Book 1" }], name: "adam" }, { books: [{ title: "Nested Book A1" }, { title: "New Book 1" }], name: "a1" }],
        mainAuthor: {
          books: [{ title: "Nested Book B" }],
          mainSubject: { name: "ms" },
          name: "ma",
          subjects: [{ keywords: [], name: "s1" }, { keywords: [{ keywordName: "k1" }, { keywordName: "k2" }], name: "s2" }]
        },
        title: "New Book 1"
      }
    ],
    name: "adam"
  }
];
