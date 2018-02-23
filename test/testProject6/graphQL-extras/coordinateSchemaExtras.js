export default {
  Query: `
    getCoordinate(_id: String): [Coordinate]
  `,
  Mutation: `
    updateCoordinate(_id: String, Updates: CoordinateMutationInput): [Coordinate]
  `
};
