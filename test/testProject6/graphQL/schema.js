import { query as Type1Query, mutation as Type1Mutation, type as Type1Type } from './Type1/schema';
import { query as Type2Query, mutation as Type2Mutation, type as Type2Type } from './Type2/schema';
import { query as Type3Query, mutation as Type3Mutation, type as Type3Type } from './Type3/schema';
import { query as Type4Query, mutation as Type4Mutation, type as Type4Type } from './Type4/schema';
    
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

  ${Type3Type}

  ${Type4Type}

  type Query {
    ${Type1Query}

    ${Type2Query}

    ${Type3Query}

    ${Type4Query}
  }

  type Mutation {
    ${Type1Mutation}

    ${Type2Mutation}

    ${Type3Mutation}

    ${Type4Mutation}
  }

`