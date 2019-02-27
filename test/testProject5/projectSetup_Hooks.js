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
  Author: class {
    beforeInsert(obj, root, args, context, ast) {
      if (/^ABORT/.test(obj.name)) {
        return false;
      }
      if (/^BUMP/.test(obj.name)) {
        obj.name += "a";
      }
    }
    async afterInsert(obj, root, args, context, ast) {
      if (/^BUMP/.test(obj.name)) {
        let db = await root.db;
        obj.name += "b";
        db.collection("authors").updateOne({ _id: obj._id }, { $set: { name: obj.name } });
      }
    }
  },
  Book: class {
    beforeInsert(obj, root, args, context, ast) {
      if (/^ABORT/.test(obj.title)) {
        return false;
      }
    }
  }
};
