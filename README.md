# mongo-graphql-starter

**Warning - this project is extremely young and still rough around the edges. Don't use it for any kind of serious production use.**

This utility will scaffold a basic GraphQL schema and resolvers, with filters working out of the box, based on metadata you enter about your Mongo db.

The idea is to auto-generate the mundane, repetative boilerplate needed for a graphQL endpoint, then get out of your way, leaving you to code your odd or advanced edge cases as needed.

## How do you use it?

Let's work through a smple example.

First, create your db metadata like this.  Each mongo collection you'd like added to your GraphQL endpoint needs to contain the table name, and all of the fields, keyed off of the data types provided.

**projectSetupA.js**
```javascript
import { dataTypes } from "mongo-graphql-starter";
const { MongoId, String, Int, Float, ArrayOf } = dataTypes;

const Author = {
  table: "authors",
  fields: {
    _id: MongoId,
    name: String
  }
};

const Book = {
  table: "books",
  fields: {
    _id: MongoId,
    title: String,
    pages: Int,
    weight: Float,
    authors: ArrayOf(Author)
  }
};

export default {
  Author,
  Book
};
```

Now tell mongo-graphql-starter to create your schema and resolvers, like this

```javascript
import { createGraphqlSchema } from "mongo-graphql-starter";
import projectSetup from "./projectSetupA";

import path from "path";

createGraphqlSchema(projectSetup, path.resolve("./test/testProject1"));
```

There should now be a graphQL folder containing schema, resolver, and type metadata files for each type, as well as a master resolver and schema file which are aggregates over all the types.

![Image of basic scaffolding](docs-img/initialCreated.png)

Now tell express about it—and don't forget to add a root object with a `db` property that resolves to a connection to your database.  

Here's what a minimal, complete example might look like.

```javascript
import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";

const app = express(),
  dbPromise = MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter"),
  root = {
    db: dbPromise
  },
  executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers });

app.use(
  "/graphql",
  expressGraphql({
    schema: executableSchema,
    graphiql: true,
    rootValue: root
  })
);
app.listen(3000);
```

Now `http://localhost:3000/graphql` should, assuming the database above exists, and has data, allow you to run basic queries.

![Image of graphiQL](docs-img/graphiQL-running.png)

## A closer look at what's generated

All code generated is modern JavaScript, meaning ES6, plus `async` / `await` and object spread, along with ES6 modules (`import` / `export`).  If you're running Node 8.5 or better, and you're using John Dalton's [outstanding ESM loader](https://github.com/standard-things/esm) (and I'd urge you to do so) then this code should just work.  If any of those conditions are false, you'll need to pipe the results through Babel using your favorite build tool.

### All code is extensible.  

All of the schema and resolver files discussed below are only generated the first time; if you run the utility again, they will not be over-written (though an option to override that may be added later).  The idea is that generated schema and resolver files are a useful starting point that will usually need one-off tweaks and specialized use cases added later.

### Generated type-specific schemas

The book schema file generatd from the setup above looks like this

```javascript
export const type = `

type Book {
  _id: String
  title: String
  pages: Int
  weight: Float
  authors: [Author]
}

`;

export const query = `

  allBooks(
    title: String,
    title_contains: String,
    title_startsWith: String,
    title_endsWith: String,
    pages: Int,
    pages_lt: Int,
    pages_lte: Int,
    pages_gt: Int,
    pages_gte: Int,
    weight: Float,
    weight_lt: Float,
    weight_lte: Float,
    weight_gt: Float,
    weight_gte: Float
  ): [Book]

  getBook(_id: String): Book

`;
```

Each field from your metadata of course gets added to the main type. Basic queries have also been created, namely `allBooks` with filters set up for each field, depending on type; and a `getBook` query that looks up a book by _id. 

### Filters created

WIP - see the schema file above for now

### Generated type-specific resolvers 

The Book resolver looks like this

```javascript
import { decontructGraphqlQuery } from "mongo-graphql-starter";
import Book from "./Book";

export default {
  Query: {
    async allBooks(root, args, context, ast) {
      let db = await root.db,
        { filters, requestedFields, projections } = decontructGraphqlQuery(args, ast, Book);

      return (await db.collection("books").find(filters, projections)).toArray();
    },
    async getBook(root, args, context, ast) {
      let db = await root.db,
        { filters, requestedFields, projections } = decontructGraphqlQuery(args, ast, Book);

      return await db.collection("books").findOne(filters, projections);
    }
  }
};
```

The db connection is grabbed from the root object (see the setup above for how to add that).  Then the graphQL AST is parsed to determine which fields were requested, so only they can be queried from Mongo.  And of course the args are translated into the proper Mongo queries. 

## Master schema

The master schema just pieces all of the type-specific schemas together.  Feel free to add your own schemas manually, and tie them in here.  Again, this file will not be over-written on subsequent runs.

```javascript
import { query as AuthorQuery, type as AuthorType } from './Author/schema';
import { query as BookQuery, type as BookType } from './Book/schema';
    
export default `
  ${AuthorType}

  ${BookType}

  type Query {
    ${AuthorQuery}

    ${BookQuery}
  }
`
```

## Master resolver

Likewise for the main resolver 

```javascript
import Author from './Author/resolver';
import Book from './Book/resolver';

let { AuthorQuery, ...AuthorRest } = Author,
  { BookQuery, ...BookRest } = Book;
    
export default {
  Query: Object.assign({},
    AuthorQuery,
    BookQuery
  ),
  ...AuthorRest,
  ...BookRest
};
```

## What's next

- Add more data types, and filters
- Add basic mutations 
- Switch Mongo over to the aggregation pipeline, and add things like sorting and paging 