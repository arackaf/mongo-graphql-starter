import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";
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

setup();

async function setup() {
  let db = await MongoClient.connect(conn);

  const authorA = { name: "A 1", birthday: new Date("1982-03-22"), favoriteTag: { name: "T1", description: "Desc1" } };
  const authorB = { name: "A 2", birthday: new Date("1982-06-15"), favoriteTag: { name: "T1", description: "Desc1" } };
  const authorC = { name: "A 3", birthday: new Date("1982-07-04"), favoriteTag: { name: "T2", description: "Desc2" } };

  const cauthorA = { name: "CA 1", birthday: new Date("1982-03-22"), favoriteTag: { name: "T1", description: "Desc1" } };
  const cauthorB = { name: "CA 2", birthday: new Date("1982-06-15"), favoriteTag: { name: "T1", description: "Desc1" } };
  const cauthorC = { name: "CA 3", birthday: new Date("1982-07-04"), favoriteTag: { name: "T2", description: "Desc2" } };

  const comment1 = { text: "Comment 1", upVotes: 2, author: cauthorA };
  const comment2 = { text: "Comment 2", upVotes: 4, author: cauthorB };
  const comment3 = { text: "Comment 3", upVotes: 0, author: cauthorC };
  const comment4 = { text: "Comment 4", upVotes: 9, author: cauthorA };
  const comment5 = { text: "Comment 5", upVotes: 4, author: cauthorA };
  const comment6 = { text: "Comment 6", upVotes: 4, author: cauthorA };
  const comment7 = { text: "Comment 7", upVotes: 4, author: cauthorC };

  await Promise.all([
    db.collection("blogs").insertOne({ title: "Blog 1", author: authorA, comments: [comment1, comment2, comment3] }),
    db.collection("blogs").insertOne({ title: "Blog 2", author: authorA, comments: [] }),
    db.collection("blogs").insertOne({ title: "Blog 3", author: authorB, comments: [comment4] }),
    db.collection("blogs").insertOne({ title: "Blog 4", author: authorC, comments: [comment5, comment6] }),
    db.collection("blogs").insertOne({ title: "Blog 5", author: authorC, comments: [comment7] })
  ]);
}
