import Type1 from './Type1/resolver';
import Type2 from './Type2/resolver';
import Type3 from './Type3/resolver';
import Type4 from './Type4/resolver';

const { Query: Type1Query, Mutation: Type1Mutation, ...Type1Rest } = Type1;
const { Query: Type2Query, Mutation: Type2Mutation, ...Type2Rest } = Type2;
const { Query: Type3Query, Mutation: Type3Mutation, ...Type3Rest } = Type3;
const { Query: Type4Query, Mutation: Type4Mutation, ...Type4Rest } = Type4;

export default {
Query: Object.assign({},
Type1Query,
    Type2Query,
    Type3Query,
    Type4Query
),
Mutation: Object.assign({},
Type1Mutation,
    Type2Mutation,
    Type3Mutation,
    Type4Mutation
),
...Type1Rest,
  ...Type2Rest,
  ...Type3Rest,
  ...Type4Rest
};

