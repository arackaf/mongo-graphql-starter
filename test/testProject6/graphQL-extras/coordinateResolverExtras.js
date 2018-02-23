export default {
  Query: {
    getCoordinate() {
      return { x: -1, y: -2 };
    },
    updateCoordinate() {
      return [{ x: 1, y: 2 }, { x: 3, y: 4 }];
    }
  },
  Mutation: {
    randomMutation() {
      return { x: 5, y: 6 };
    },
    randomQuery() {
      return { x: 7, y: 8 };
    }
  }
};
