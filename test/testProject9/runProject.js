import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";
import spinUp from "./spinUp";

Promise.resolve(spinUp()).then(({ db, client, schema, queryAndMatchArray }) => {
  const app = express();

  const root = {
    db,
    client
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
