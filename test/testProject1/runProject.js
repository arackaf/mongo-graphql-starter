//"../../../../index"

import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";

import express from "express";
const app = express();

let dbPromise = MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");

var root = {
  db: dbPromise
};

const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers });

app.use(
  "/graphql",
  expressGraphql({
    schema: executableSchema,
    graphiql: true,
    rootValue: root
  })
);

app.listen(3000);
