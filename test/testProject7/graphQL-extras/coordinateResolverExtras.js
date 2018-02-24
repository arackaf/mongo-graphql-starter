export default {
  Query: {
    getCoordinate() {
      return [{ x: -1, y: -2 }, { x: -3, y: -4 }];
    },
    randomQuery() {
      return { x: 7, y: 8 };
    }
  },
  Mutation: {
    updateCoordinate() {
      return [{ x: 1, y: 2 }, { x: 3, y: 4 }];
    },
    randomMutation() {
      return { x: 5, y: 6 };
    }
  }
};
