import { MongoClient } from "mongodb";
import { graphqlHTTP as expressGraphql } from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import conn from "./connection";

import spinUp from "./spinUp";
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
