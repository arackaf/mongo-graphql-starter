export const type = `
  
  type Type3 {
    _id: String
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  
  }
  
  type Type3QueryResults {
    Type3s: [Type3],
    Meta: QueryResultsMetadata
  }

  type Type3SingleQueryResult {
    Type3: Type3
  }

  type Type3MutationResult {
    Type3: Type3
  }

  input Type3Input {
    _id: String
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type3MutationInput {
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type3Sort {
    _id: Int
    field1: Int
    field2: Int
    field3: Int
    field4: Int
    field5: Int
    field6: Int
  }
      
  input Type3Filters {
    _id: String
    _id_in: [String]
    field1_contains: String
    field1_startsWith: String
    field1_endsWith: String
    field1: String
    field1_in: [String]
    field2_contains: String
    field2_startsWith: String
    field2_endsWith: String
    field2: String
    field2_in: [String]
    field3_contains: String
    field3_startsWith: String
    field3_endsWith: String
    field3: String
    field3_in: [String]
    field4_contains: String
    field4_startsWith: String
    field4_endsWith: String
    field4: String
    field4_in: [String]
    field5_contains: String
    field5_startsWith: String
    field5_endsWith: String
    field5: String
    field5_in: [String]
    field6_contains: String
    field6_startsWith: String
    field6_endsWith: String
    field6: String
    field6_in: [String]
    OR: [Type3Filters]
  }
  
  `;
  
  
  export const mutation = `
  
    createType3(
      Type3: Type3Input
    ): Type3MutationResult
  
    updateType3(
      _id: String,
      Type3: Type3MutationInput
    ): Type3MutationResult
  
    deleteType3(
      _id: String
    ): Boolean
  
  `;
  
  
  export const query = `
  
    allType3s(
      _id: String,
      _id_in: [String],
      field1_contains: String,
      field1_startsWith: String,
      field1_endsWith: String,
      field1: String,
      field1_in: [String],
      field2_contains: String,
      field2_startsWith: String,
      field2_endsWith: String,
      field2: String,
      field2_in: [String],
      field3_contains: String,
      field3_startsWith: String,
      field3_endsWith: String,
      field3: String,
      field3_in: [String],
      field4_contains: String,
      field4_startsWith: String,
      field4_endsWith: String,
      field4: String,
      field4_in: [String],
      field5_contains: String,
      field5_startsWith: String,
      field5_endsWith: String,
      field5: String,
      field5_in: [String],
      field6_contains: String,
      field6_startsWith: String,
      field6_endsWith: String,
      field6: String,
      field6_in: [String],
      OR: [Type3Filters],
      SORT: Type3Sort,
      SORTS: [Type3Sort],
      LIMIT: Int,
      SKIP: Int,
      PAGE: Int,
      PAGE_SIZE: Int
    ): Type3QueryResults
  
    getType3(
      _id: String
    ): Type3SingleQueryResult
  
  `;
  
  
  