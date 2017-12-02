export default {
  queryPreprocess(root, args, context, ast) {
    args.poisonField = 1;
  },
  queryMiddleware(queryPacket, root, args, context, ast) {
    if (!queryPacket.$match) {
      queryPacket.$match = {};
    }
    queryPacket.$match.userId = 1;
  },
  beforeInsert(obj, root, args, context, ast) {
    obj.userId = 1;
  },
  beforeUpdate(filters, updates, root, args, context, ast) {
    filters.userId = 1;
    if (!updates.$inc) {
      updates.$inc = {};
    }
    updates.$inc.autoUpdateField = 1;
  },
  async afterUpdate(filters, updates, root, args, context, ast) {
    updates.x = 1;
    let db = await root.db;
    await db.collection("updateInfo").remove({});
    await db.collection("updateInfo").insert({ updatedId: filters._id, x: updates.x });
  },
  adjustResults(results) {
    results.forEach(result => {
      if (result.autoAdjustField != null) {
        result.autoAdjustField++;
      }
    });
  },
  Type2: {
    queryPreprocess(root, args, context, ast) {
      args.poisonField++;
    },
    queryMiddleware(queryPacket, root, args, context, ast) {
      queryPacket.$match.userId++;
    },
    beforeInsert(obj, root, args, context, ast) {
      obj.userId++;
    },
    beforeUpdate(filters, updates, root, args, context, ast) {
      filters.userId++;
      updates.$inc.autoUpdateField++;
    },
    async afterUpdate(filters, updates, root, args, context, ast) {
      updates.x++;
      let db = await root.db;
      await db.collection("updateInfo").remove({});
      await db.collection("updateInfo").insert({ updatedId: filters._id, x: updates.x });
    },
    adjustResults(results) {
      results.forEach(result => {
        if (result.autoAdjustField != null) {
          result.autoAdjustField++;
        }
      });
    }
  }
};
