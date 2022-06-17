export default {
  table: "thing1",
  typeName: "Thing1",
  fields: {
    _id: "MongoId",
    q__id: "MongoId",
    q_str: "String",
    q_strArr: "StringArray",
    q_bool: "Boolean",
    q_int: "Int",
    q_intArr: "IntArray",
    q_float: "Float",
    q_floatArr: "FloatArray",
    q_date: {
      __isDate: true,
      format: "%m/%d/%Y"
    },
    q_json: "JSON",
    nq__id: "MongoId",
    nq_str: "String",
    nq_strArr: "StringArray",
    nq_bool: "Boolean",
    nq_int: "Int",
    nq_intArr: "IntArray",
    nq_float: "Float",
    nq_floatArr: "FloatArray",
    nq_date: {
      __isDate: true,
      format: "%m/%d/%Y"
    },
    nq_json: "JSON"
  },
  relationships: {}
};
