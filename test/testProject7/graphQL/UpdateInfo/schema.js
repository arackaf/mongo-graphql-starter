export const type = `
  
  type UpdateInfo {
    _id: String
    updatedId: String
    x: Int
  
  }
  
  type UpdateInfoQueryResults {
    UpdateInfos: [UpdateInfo],
    Meta: QueryResultsMetadata
  }

  type UpdateInfoSingleQueryResult {
    UpdateInfo: UpdateInfo
  }

  type UpdateInfoMutationResult {
    UpdateInfo: UpdateInfo
  }

  input UpdateInfoInput {
    _id: String
    updatedId: String
    x: Int
  }
  
  input UpdateInfoMutationInput {
    updatedId: String
    x: Int
    x_INC: Int
    x_DEC: Int
  }
  
  input UpdateInfoSort {
    _id: Int
    updatedId: Int
    x: Int
  }
      
  input UpdateInfoFilters {
    _id: String
    _id_ne: String
    _id_in: [String]
    updatedId: String
    updatedId_ne: String
    updatedId_in: [String]
    x_lt: Int
    x_lte: Int
    x_gt: Int
    x_gte: Int
    x: Int
    x_ne: Int
    x_in: [Int]
    OR: [UpdateInfoFilters]
  }
  
  `;
  
  
  export const mutation = `
  
    createUpdateInfo(
      UpdateInfo: UpdateInfoInput
    ): UpdateInfoMutationResult
  
    updateUpdateInfo(
      _id: String,
      UpdateInfo: UpdateInfoMutationInput
    ): UpdateInfoMutationResult
  
    deleteUpdateInfo(
      _id: String
    ): Boolean
  
  `;
  
  
  export const query = `
  
    allUpdateInfos(
      _id: String,
      _id_ne: String,
      _id_in: [String],
      updatedId: String,
      updatedId_ne: String,
      updatedId_in: [String],
      x_lt: Int,
      x_lte: Int,
      x_gt: Int,
      x_gte: Int,
      x: Int,
      x_ne: Int,
      x_in: [Int],
      OR: [UpdateInfoFilters],
      SORT: UpdateInfoSort,
      SORTS: [UpdateInfoSort],
      LIMIT: Int,
      SKIP: Int,
      PAGE: Int,
      PAGE_SIZE: Int
    ): UpdateInfoQueryResults
  
    getUpdateInfo(
      _id: String
    ): UpdateInfoSingleQueryResult
  
  `;
  
  
  