export default {
  fields: {
    name: "String",
    birthday: {
      __isDate: true,
      format: "%m/%d/%Y"
    }
  }  
};