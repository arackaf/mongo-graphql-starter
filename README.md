# mongo-graphql-starter

**Warning - this project is extremely young and still rough around the edges. Don't use it for any kind of serious production use.**

This utility will scaffold a basic GraphQL schema and resolvers, with filters working out of the box, based on metadata you enter about your Mongo db.

The philosophy of this project is to auto-generate the repetative boilerplate needed for a graphQL endpoint, while leaving you free to code up all your odd or advanced edge cases as needed.

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

Now tell mongo-graphql-starter to created your schema and resolvers, like this

```javascript
import { createGraphqlSchema } from "mongo-graphql-starter";
import projectSetup from "./projectSetupA";

import path from "path";

createGraphqlSchema(projectSetup, path.resolve("./test/testProject1"));
```

There should now be a graphQL folder containing schema, resolver, and type metadata files for each type, as well as a master resolver and schema file which are aggregates over all the types.

![Image of basic scaffolding](docs-img/initialCreated.png)

Now fire up express and connect it to the GraphQL schema that was just created—don't forget to add a root object with a `db` property that resolves to a connection to your database.

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

Now `http://localhost:3000/graphql` should, assuming the database above exists, and has data, allow you to run basic queries against your data

![Image of graphiQL](docs-img/graphiQL-running.png)

## A closer look at what's generated

WIP