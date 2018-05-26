export default {
  Root: {
    queryPreprocess(root, args, context, ast) {
      args.poisonField = 1;
    },
    queryMiddleware(queryPacket, root, args, context, ast) {
      if (!queryPacket.$match) {
        queryPacket.$match = {};
      }
      queryPacket.$match.userId = 1;
    },
    queryPreAggregate(aggregateItems, root, args, context, ast) {
      let match = aggregateItems.find(item => item.$match);
      if (match.$match.field2 === "ADJUST" || args._id == "591b74d036f369d06bb7781d") {
        match.$match = { field2: "C" };
      }
    },
    beforeInsert(obj, root, args, context, ast) {
      if (obj.field1 === "KILL") {
        return false;
      }
      obj.userId = 1;
    },
    async afterInsert(obj, root, args, context, ast) {
      obj.y = 1;
      let db = await root.db;

      await db.collection("insertInfo").remove({});
      await db.collection("insertInfo").insert({ insertedId: obj._id + "", y: obj.y });
    },
    beforeUpdate(match, updates, root, args, context, ast) {
      match.userId = 1;
      if (args.Updates && args.Updates.field1 === "ABC123") {
        return false;
      }
      if (!updates.$inc) {
        updates.$inc = {};
      }
      updates.$inc.autoUpdateField = 1;
    },
    async afterUpdate(match, updates, root, args, context, ast) {
      updates.x = 1;
      let db = await root.db;
      await db.collection("updateInfo").remove({});
      await db.collection("updateInfo").insert({ updatedId: match._id, x: updates.x });
    },
    beforeDelete(match, root, args, context, ast) {
      if (args._id == "59334468a71fc3de245e2d6d") {
        return false;
      }
      match.userId = 1;
    },
    async afterDelete(match, root, args, context, ast) {
      match.x = 1;
      let db = await root.db;
      await db.collection("deleteInfo").remove({});
      await db.collection("deleteInfo").insert({ deletedId: match._id, x: match.x });
    },
    adjustResults(results) {
      results.forEach(result => {
        if (result.autoAdjustField != null) {
          result.autoAdjustField++;
        }
      });
    }
  },
  Type2: {
    queryPreprocess(root, args, context, ast) {
      args.poisonField++;
    },
    queryMiddleware(queryPacket, root, args, context, ast) {
      queryPacket.$match.userId++;
    },
    queryPreAggregate(aggregateItems, root, args, context, ast) {
      let match = aggregateItems.find(item => item.$match);
      if (match.$match.field2 === "C") {
        match.$match = { field2: "A" };
      }
    },
    beforeInsert(obj, root, args, context, ast) {
      if (obj.field1 === "BAD") {
        return false;
      }
      obj.userId++;
    },
    async afterInsert(obj, root, args, context, ast) {
      obj.y++;
      let db = await root.db;

      await db.collection("insertInfo").remove({});
      await db.collection("insertInfo").insert({ insertedId: obj._id + "", y: obj.y });
    },
    beforeUpdate(filters, updates, root, args, context, ast) {
      if (args.Updates && args.Updates.field1 === "XYZ123") {
        return false;
      }
      filters.userId++;
      updates.$inc.autoUpdateField++;
    },
    async afterUpdate(filters, updates, root, args, context, ast) {
      updates.x++;
      let db = await root.db;
      await db.collection("updateInfo").remove({});
      await db.collection("updateInfo").insert({ updatedId: filters._id, x: updates.x });
    },
    beforeDelete(match, root, args, context, ast) {
      if (args._id == "591b74d036f369d06bb7781d") {
        return false;
      }
      match.field1 = { $ne: "XXX" };
    },
    async afterDelete(match, root, args, context, ast) {
      match.x++;
      let db = await root.db;
      await db.collection("deleteInfo").remove({});
      await db.collection("deleteInfo").insert({ deletedId: match._id, x: match.x });
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
