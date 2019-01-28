import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";
import spinUp from "./spinUp";

const dbPromise = MongoClient.connect(
  "mongodb://localhost:27017",
  { useNewUrlParser: true }
).then(client => client.db("mongo-graphql-starter"));

const root = {
  db: dbPromise
};

Promise.resolve(spinUp()).then(({ db, schema, queryAndMatchArray }) => {
  const app = express();
  const root = {
    db
  };

  app.use(
    "/graphql",
    expressGraphql({
      schema,
      graphiql: true,
      rootValue: root
    })
  );
  app.listen(3000);
});
