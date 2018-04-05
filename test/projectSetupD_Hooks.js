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
      console.log(obj.name, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      if (/^BUMP/.test(obj.name)) {
        obj.name += "a";
        console.log(obj.name, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
      }
    },
    async afterInsert(obj, root, args, context, ast) {
      if (/^BUMP/.test(obj.name)) {
        let db = await root.db;
        obj.name += "b";
        db.collection("authors").update({ _id: obj._id }, { $set: { name: obj.name + "b" } });
      }
    }
  }
};
