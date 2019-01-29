export default {
  Root: {
    queryPreprocess(root, args, context, ast) {},
    queryMiddleware(queryPacket, root, args, context, ast) {},
    beforeInsert(obj, root, args, context, ast) {},
    async afterInsert(obj, root, args, context, ast) {},
    beforeUpdate(match, updates, root, args, context, ast) {},
    async afterUpdate(match, updates, root, args, context, ast) {},
    beforeDelete(match, root, args, context, ast) {},
    async afterDelete(match, root, args, context, ast) {},
    adjustResults(results) {}
  },
  Author: {
    beforeInsert(obj, root, args, context, ast) {
      if (/^KILL/i.test(obj.name)) {
        throw "Don't insert author";
      }
    }
  },
  Book: {
    beforeInsert(obj, root, args, context, ast) {
      if (/^KILL/i.test(obj.title)) {
        throw "Don't insert book";
      }
    }
  }
};
