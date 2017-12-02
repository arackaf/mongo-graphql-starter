export default {
  Root: {
    queryPreprocess(root, args, context, ast) {
      //This will be called
    },
    queryMiddleware(queryPacket, root, args, context, ast) {
      //This will be called
    },
    beforeInsert(obj, root, args, context, ast) {
      //This will be called
    },
    beforeUpdate(match, updates, root, args, context, ast) {
      //This will be called
    },
    async afterUpdate(match, updates, root, args, context, ast) {
      //This will be called
    },
    beforeDelete(match, root, args, context, ast) {
      //This will be called
    },
    async afterDelete(match, root, args, context, ast) {
      //This will be called
    },
    adjustResults(results) {
      //This will be called
    }
  }
};
