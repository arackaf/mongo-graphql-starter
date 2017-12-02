import { query as Type1Query, mutation as Type1Mutation, type as Type1Type } from './Type1/schema';
import { query as Type2Query, mutation as Type2Mutation, type as Type2Type } from './Type2/schema';
import { query as UpdateInfoQuery, mutation as UpdateInfoMutation, type as UpdateInfoType } from './UpdateInfo/schema';
import { query as DeleteInfoQuery, mutation as DeleteInfoMutation, type as DeleteInfoType } from './DeleteInfo/schema';
    
export default `

  type QueryResultsMetadata {
    count: Int
  }

  input StringArrayUpdate {
    index: Int,
    value: String
  }

  input IntArrayUpdate {
    index: Int,
    value: Int
  }

  input FloatArrayUpdate {
    index: Int,
    value: Float
  }

  ${Type1Type}

  ${Type2Type}

  ${UpdateInfoType}

  ${DeleteInfoType}

  type Query {
    ${Type1Query}

    ${Type2Query}

    ${UpdateInfoQuery}

    ${DeleteInfoQuery}
  }

  type Mutation {
    ${Type1Mutation}

    ${Type2Mutation}

    ${UpdateInfoMutation}

    ${DeleteInfoMutation}
  }

`