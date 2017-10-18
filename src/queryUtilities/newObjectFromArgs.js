import { Date, MongoId } from "../createGraphqlSchema/dataTypes";

export default function(args, typeMetadata) {
  return Object.keys(args).reduce((obj, k) => {
    let field = typeMetadata.fields[k];
    if (!field) return obj;

    if (field == Date || (typeof field === "object" && field.__isDate)) {
      obj[k] = new Date(args[k]);
    } else {
      obj[k] = args[k];
    }

    return obj;
  }, {});
}
