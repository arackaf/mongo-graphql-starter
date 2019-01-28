import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";
import conn from "./connection";

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
