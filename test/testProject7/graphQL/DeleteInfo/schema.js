export const type = `
  
  type DeleteInfo {
    _id: String
    deletedId: String
    x: Int
  
  }
  
  type DeleteInfoQueryResults {
    DeleteInfos: [DeleteInfo],
    Meta: QueryResultsMetadata
  }

  type DeleteInfoSingleQueryResult {
    DeleteInfo: DeleteInfo
  }

  type DeleteInfoMutationResult {
    DeleteInfo: DeleteInfo
  }

  input DeleteInfoInput {
    _id: String
    deletedId: String
    x: Int
  }
  
  input DeleteInfoMutationInput {
    deletedId: String
    x: Int
    x_INC: Int
    x_DEC: Int
  }
  
  input DeleteInfoSort {
    _id: Int
    deletedId: Int
    x: Int
  }
      
  input DeleteInfoFilters {
    _id: String
    _id_ne: String
    _id_in: [String]
    deletedId: String
    deletedId_ne: String
    deletedId_in: [String]
    x_lt: Int
    x_lte: Int
    x_gt: Int
    x_gte: Int
    x: Int
    x_ne: Int
    x_in: [Int]
    OR: [DeleteInfoFilters]
  }
  
  `;
  
  
  export const mutation = `
  
    createDeleteInfo(
      DeleteInfo: DeleteInfoInput
    ): DeleteInfoMutationResult
  
    updateDeleteInfo(
      _id: String,
      DeleteInfo: DeleteInfoMutationInput
    ): DeleteInfoMutationResult
  
    deleteDeleteInfo(
      _id: String
    ): Boolean
  
  `;
  
  
  export const query = `
  
    allDeleteInfos(
      _id: String,
      _id_ne: String,
      _id_in: [String],
      deletedId: String,
      deletedId_ne: String,
      deletedId_in: [String],
      x_lt: Int,
      x_lte: Int,
      x_gt: Int,
      x_gte: Int,
      x: Int,
      x_ne: Int,
      x_in: [Int],
      OR: [DeleteInfoFilters],
      SORT: DeleteInfoSort,
      SORTS: [DeleteInfoSort],
      LIMIT: Int,
      SKIP: Int,
      PAGE: Int,
      PAGE_SIZE: Int
    ): DeleteInfoQueryResults
  
    getDeleteInfo(
      _id: String
    ): DeleteInfoSingleQueryResult
  
  `;
  
  
  