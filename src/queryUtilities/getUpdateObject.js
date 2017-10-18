import { DateType, MongoIdType } from "../createGraphqlSchema/dataTypes";

export default function(args, typeMetadata) {
  return {
    $set: Object.keys(args).reduce((obj, k) => {
      let field = typeMetadata.fields[k];
      if (!field || k === "_id") return obj;

      if (field == DateType || (typeof field === "object" && field.__isDate)) {
        obj[k] = new Date(args[k]);
      } else {
        obj[k] = args[k];
      }

      return obj;
    }, {})
  };
}
