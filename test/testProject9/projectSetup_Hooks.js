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
    },
    afterUpdate(match, updates, root, args, context, ast) {
      if (args.Updates && args.Updates.name && /^KILL/i.test(args.Updates.name)) {
        throw "Kill author update";
      }
    },
    afterDelete() {
      if (global.cancelDelete) {
        throw "Delete cancelled";
      }
    }
  },
  Book: {
    beforeInsert(obj, root, args, context, ast) {
      if (/^KILL/i.test(obj.title)) {
        throw "Don't insert book";
      }
    },
    afterInsert(obj, root, args, context, ast) {
      if (/^THROW_AFTER/i.test(obj.title)) {
        throw "Throw after book insert";
      }
    },
    afterUpdate(match, updates, root, args, context, ast) {
      if (args.Updates && args.Updates.title && /^KILL/i.test(args.Updates.title)) {
        throw "Kill book update";
      }
    }
  }
};
