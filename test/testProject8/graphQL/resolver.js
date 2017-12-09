import Thing from './Thing/resolver';

const { Query: ThingQuery, Mutation: ThingMutation, ...ThingRest } = Thing;

export default {
Query: Object.assign({},
ThingQuery
),
Mutation: Object.assign({},
ThingMutation
),
...ThingRest
};

