import Type1 from './Type1/resolver';
import Type2 from './Type2/resolver';
import UpdateInfo from './UpdateInfo/resolver';
import DeleteInfo from './DeleteInfo/resolver';

const { Query: Type1Query, Mutation: Type1Mutation, ...Type1Rest } = Type1;
const { Query: Type2Query, Mutation: Type2Mutation, ...Type2Rest } = Type2;
const { Query: UpdateInfoQuery, Mutation: UpdateInfoMutation, ...UpdateInfoRest } = UpdateInfo;
const { Query: DeleteInfoQuery, Mutation: DeleteInfoMutation, ...DeleteInfoRest } = DeleteInfo;

export default {
Query: Object.assign({},
Type1Query,
    Type2Query,
    UpdateInfoQuery,
    DeleteInfoQuery
),
Mutation: Object.assign({},
Type1Mutation,
    Type2Mutation,
    UpdateInfoMutation,
    DeleteInfoMutation
),
...Type1Rest,
  ...Type2Rest,
  ...UpdateInfoRest,
  ...DeleteInfoRest
};

