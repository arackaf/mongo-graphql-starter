export default {
  Root: {
    queryPreprocess({ db, root, args, context, ast }) {},
    queryMiddleware(queryPacket, { db, root, args, context, ast }) {},
    beforeInsert(obj, { db, root, args, context, ast, session }) {},
    async afterInsert(obj, { db, root, args, context, ast, session }) {},
    beforeUpdate(match, updates, { db, root, args, context, ast, session }) {},
    async afterUpdate(match, updates, { db, root, args, context, ast, session }) {},
    beforeDelete(match, { db, root, args, context, ast, session }) {},
    async afterDelete(match, { db, root, args, context, ast, session }) {},
    adjustResults(results) {}
  },
  Author: {
    beforeInsert(obj, { db, root, args, context, ast, session }) {
      if (/^KILL/i.test(obj.name)) {
        throw "Don't insert author";
      }
    },
    afterUpdate(match, updates, { db, root, args, context, ast, session }) {
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
    beforeInsert(obj, { db, root, args, context, ast, session }) {
      if (/^KILL/i.test(obj.title)) {
        throw "Don't insert book";
      }
    },
    afterInsert(obj, { db, root, args, context, ast, session }) {
      if (/^THROW_AFTER/i.test(obj.title)) {
        throw "Throw after book insert";
      }
    },
    afterUpdate(match, updates, { db, root, args, context, ast, session }) {
      if (args.Updates && args.Updates.title && /^KILL/i.test(args.Updates.title)) {
        throw "Kill book update";
      }
      if (global.cancelUpdate) {
        throw "Update cancelled after the fact";
      }
    }
  }
};
