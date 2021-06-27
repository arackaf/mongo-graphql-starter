export default {
  Query: {
    getAddedType(arg) {
      return {
        val: "Some Value"
      };
    }
  },
  Mutation: {
    updateAddedType(arg) {
      return true;
    }
  }
};
