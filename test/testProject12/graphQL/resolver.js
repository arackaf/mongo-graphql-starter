import GraphQLJSON from "graphql-type-json";

import Thing1, { Thing1 as Thing1Rest } from "./Thing1/resolver";

const { Query: Thing1Query, Mutation: Thing1Mutation } = Thing1;

export default {
  JSON: GraphQLJSON,
  Query: Object.assign({}, Thing1Query),
  Mutation: Object.assign({}, Thing1Mutation),
  Thing1: { ...Thing1Rest }
};
