export default {
  AddedType: {
    val2() {
      return "val2";
    }
  },
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
