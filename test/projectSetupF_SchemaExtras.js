export default {
  Query: `
    getCoordinate(_id: String): [Coordinate]
    randomQuery: Coordinate
    `,
  Mutation: `
    updateCoordinate(_id: String, Updates: CoordinateMutationInput): [Coordinate]
    randomMutation: Coordinate
  `
};
