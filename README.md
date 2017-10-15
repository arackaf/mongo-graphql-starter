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

## Filters created

### String filters

If your field is named `title` then the following filters will be available on your `all${TypeName}s` filter

Exact match

`title: "My Title"` - will match results with exactly that title value

String contains

`title_contains: "My"` - will match results with the string `My` anywhere inside, case insensitively. 

String starts with

`title_startsWith: "My"` - will match results that start with the string `My`, case insensitively. 

String ends with

`title_endsWith: "title"` - will match results that end with the string `title`, case insensitively. 

### Int filters

If your field is named `pages` then the following filters will be available on your `all${TypeName}s` filter

Exact match

`pages: 200` - will match results with exactly that `pages` value

Less than

`pages_lt: 200` - will match results where `pages` is less than 200 

Less than or equal

`pages_lte: 200` - will match results where `pages` is less than or equal to 200 

Greater than

`pages_gt: 200` - will match results where `pages` is greater than 200 

Greater than or equal

`pages_gte: 200` - will match results where `pages` is greater than or equal to 200 

### Float filters

If your field is named `weight` then the following filters will be available on your `all${TypeName}s` filter

Exact match

`weight: 200` - will match results with exactly that `weight` value

Less than

`weight_lt: 200` - will match results where `weight` is less than 200 

Less than or equal

`weight_lte: 200` - will match results where `weight` is less than or equal to 200 

Greater than

`weight_gt: 200` - will match results where `weight` is greater than 200 

Greater than or equal

`weight_gte: 200` - will match results where `weight` is greater than or equal to 200 

### OR Queries

Combining filters with Mongo's `$or` is easy.  Just use the same API, but with `OR` instead of `$or` (`$` doesn't seem to be a valid character for GraphQL identifiers).  For example

```javascript
{
  allBooks(
    pages_gt: 50, 
    OR: [
      {title: "Book 1", pages: 100}, 
      {title_contains: "ook", OR: [{weight_gt: 2}, {pages_lt: 0}]}
    ]
  ) {
    _id
    title
    pages
    weight
  }
}
```

will match all results where 

```
pages is greater than 50 
  AND (
    (title is "Book 1" AND pages is 100) 
    OR 
    (title contains "ook" 
      AND 
        (weight is greater than 2 OR pages is less than 0) 
    )
  )
```

### Sorting

To sort, use the `SORT` argument, and pass it an object literal with the field by which you'd like to sort, with the Mongo value of 1 for ascending, or -1 for descending.  For example
0
```
allBooks(SORT: {title: 1}){title, pages}
```

To sort by multiple fields, use `SORTS`, and send an array of those same object literals.  For example

```
allBooks(SORTS: [{pages: 1}, {title: -1}]){title, pages}
```

which will sort by pages ascending, and then by title descending. 

### Paging

Page your data in one of two ways.

Pass `LIMIT` and `SKIP` to your query, which will map directly to the `$limit` and `$skip` Mongo aggregation arguments.

Or send over `PAGE` and `PAGE_SIZE` arguments, which calculate `$limit` and `$skip` for you, and add to the Mongo query.

### Middleware

Middleware allows you to add cross cutting concerns to your resolvers. After your query is processed, and all of the Mongo filters, projections, paging, etc are computed, these values are passed through each registered middleware, allowing them to modify these values as needed.  For example

```javascript
import { middleware } from "mongo-graphql-starter";

middleware.use((deconstructedQuery, root, args, context, ast) => {
  deconstructedQuery.$match.title = "Book 1";
});
```

will, uselessly, force every query run on every type to add a title match of "Book 1".

A more useful example, coming soon, would be middleware that takes the `userId` value from the Express request object, representing the logged-on user, and adds it to all queries so they only return results belonging to the current user.

---

From the middleware shown above, `deconstructedQuery` is the entire packet of Mongo query items that were calculated from the args passed to your resolver.  This object contains:

`$match` - the Mongo filters

`$project` - the Mongo projection object

`$sort` - the Mongo sort object

`$limit` - the limit value

`$skip` - the skip value

This is your opportunity to mutate any of these values.  The remaining arguments passed to your middleware are the same ones passed to all resolver:

`root` -  the root object. This will have your db object, and anything else you chose to add to it

`args` - the graphQL arguments object

`context` - by default your Express request object 

`ast` - the entire graphQL query AST with complete info about your query: query name, fields requested, etc

If you need to do asynchronous work, just have the method return a Promise.  The generated graphQL resolver will `Promise.resolve` each middleware you register, then continue on and run the Mongo query with whatever values you leave in `deconstructedQuery`.

### Preprocessor

Similar to middleware, preprocessors run before any work is done in the resolvers, and are passed the `root`, `args`, `context` and `ast` objects to be mutated as needed.  Use this as an opportunity to amend or validate what the user sends over.  For example, 

```javascript
import { preprocessor } from "mongo-graphql-starter";

preprocessor.use((root, args, context, ast) => {
  args.PAGE = 2;
  args.PAGE_SIZE = 3;
});
```

will force every query to have a page size of 3, and request page number 2.  A more useful example might enforce a maximum `PAGE_SIZE` value, so users don't request too much data in one request. 

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