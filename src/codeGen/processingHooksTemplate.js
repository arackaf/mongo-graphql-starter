export default {
  queryPreprocess(root, args, context, ast) {
    //this will be called
  },
  queryMiddleware(queryPacket, root, args, context, ast) {
    //this will be called
  },
  beforeInsert(obj, root, args, context, ast) {
    //this will be called
  },
  beforeUpdate(filter, updates, root, args, context, ast) {
    //this will be called
  },
  adjustResults(results) {
    //this will be called
  }
};
