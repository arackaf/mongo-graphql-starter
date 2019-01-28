import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";
import conn from "./connection";

const dbPromise = MongoClient.connect(
  "mongodb://localhost:27017",
  { useNewUrlParser: true }
).then(client => client.db("mongo-graphql-starter"));

const root = {
  db: dbPromise
};

const app = express();
const root = {
  db
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
