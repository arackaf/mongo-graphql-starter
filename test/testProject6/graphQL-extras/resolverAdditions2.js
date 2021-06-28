module.exports = {
  Query: {
    getAddedType2(arg) {
      return {
        val: "Some Value"
      };
    }
  },
  Mutation: {
    updateAddedType2(arg) {
      return true;
    }
  }
};
