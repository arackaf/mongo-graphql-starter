export default {
  Root: {
    queryPreprocess({ root, args, context, ast }) {
      args.poisonField = 1;
    },
    queryMiddleware(queryPacket, { root, args, context, ast }) {
      if (!queryPacket.$match) {
        queryPacket.$match = {};
      }
      queryPacket.$match.userId = 1;
    },
    queryPreAggregate(aggregateItems, { root, args, context, ast }) {
      let match = aggregateItems.find(item => item.$match);
      if (match.$match.field2 === "ADJUST" || args._id == "591b74d036f369d06bb7781d") {
        match.$match = { field2: "C" };
      }
    },
    beforeInsert(obj, { db, root, args, context, ast, session }) {
      if (obj.field1 === "KILL") {
        return false;
      }
      obj.userId = 1;
    },
    async afterInsert(obj, { db, root, args, context, ast, session }) {
      obj.y = 1;
      await db.collection("insertInfo").deleteMany({});
      await db.collection("insertInfo").insertOne({ insertedId: obj._id + "", y: obj.y });
    },
    beforeUpdate(match, updates, { db, root, args, context, ast, session }) {
      match.userId = 1;
      if (args.Updates && args.Updates.field1 === "ABC123") {
        return false;
      }
      if (!updates.$inc) {
        updates.$inc = {};
      }
      updates.$inc.autoUpdateField = 1;
    },
    async afterUpdate(match, updates, { db, root, args, context, ast, session }) {
      updates.x = 1;
      await db.collection("updateInfo").deleteMany({});
      await db.collection("updateInfo").insertOne({ updatedId: match._id, x: updates.x });
    },
    beforeDelete(match, { db, root, args, context, ast, session }) {
      if (args._id == "59334468a71fc3de245e2d6d") {
        return false;
      }
      match.userId = 1;
    },
    async afterDelete(match, { db, root, args, context, ast, session }) {
      match.x = 1;
      await db.collection("deleteInfo").deleteMany({});
      await db.collection("deleteInfo").insertOne({ deletedId: match._id, x: match.x });
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
    queryPreprocess({ root, args, context, ast }) {
      args.poisonField++;
    },
    queryMiddleware(queryPacket, { root, args, context, ast }) {
      queryPacket.$match.userId++;
    },
    queryPreAggregate(aggregateItems, { root, args, context, ast }) {
      let match = aggregateItems.find(item => item.$match);
      if (match.$match.field2 === "C") {
        match.$match = { field2: "A" };
      }
    },
    beforeInsert(obj, { db, root, args, context, ast, session }) {
      if (obj.field1 === "BAD") {
        return false;
      }
      obj.userId++;
    },
    async afterInsert(obj, { db, root, args, context, ast, session }) {
      obj.y++;

      await db.collection("insertInfo").deleteMany({});
      await db.collection("insertInfo").insertOne({ insertedId: obj._id + "", y: obj.y });
    },
    beforeUpdate(filters, updates, { db, root, args, context, ast, session }) {
      if (args.Updates && args.Updates.field1 === "XYZ123") {
        return false;
      }
      filters.userId++;
      updates.$inc.autoUpdateField++;
    },
    async afterUpdate(filters, updates, { db, root, args, context, ast, session }) {
      updates.x++;
      await db.collection("updateInfo").deleteMany({});
      await db.collection("updateInfo").insertOne({ updatedId: filters._id, x: updates.x });
    },
    beforeDelete(match, { db, root, args, context, ast, session }) {
      if (args._id == "591b74d036f369d06bb7781d") {
        return false;
      }
      match.field1 = { $ne: "XXX" };
    },
    async afterDelete(match, { db, root, args, context, ast, session }) {
      match.x++;
      await db.collection("deleteInfo").deleteMany({});
      await db.collection("deleteInfo").insertOne({ deletedId: match._id, x: match.x });
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
