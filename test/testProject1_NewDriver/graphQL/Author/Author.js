export default {
  typeName: "Author",
  fields: {
    name: "String",
    birthday: {
      __isDate: true,
      format: "%m/%d/%Y"
    },
    strings: "StringArray"
  }
};