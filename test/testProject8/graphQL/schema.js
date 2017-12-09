import { query as ThingQuery, mutation as ThingMutation, type as ThingType } from './Thing/schema';
    
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

  ${ThingType}

  type Query {
    ${ThingQuery}
  }

  type Mutation {
    ${ThingMutation}
  }

`