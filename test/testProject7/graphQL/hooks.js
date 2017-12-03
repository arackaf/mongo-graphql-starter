class HooksRoot {
  queryPreprocess(root, args, context, ast) {
    args.poisonField = 1;
  }
  queryMiddleware(queryPacket, root, args, context, ast) {
    if (!queryPacket.$match) {
      queryPacket.$match = {};
    }
    queryPacket.$match.userId = 1;
  }
  beforeInsert(obj, root, args, context, ast) {
    if (obj.field1 === "KILL") {
      return false;
    }
    obj.userId = 1;
  }
  async afterInsert(obj, root, args, context, ast) {
    obj.y = 1;
    let db = await root.db;

    await db.collection("insertInfo").remove({});
    await db.collection("insertInfo").insert({ insertedId: obj._id + "", y: obj.y });
  }
  beforeUpdate(match, updates, root, args, context, ast) {
    match.userId = 1;
    if (!updates.$inc) {
      updates.$inc = {};
    }
    updates.$inc.autoUpdateField = 1;
  }
  async afterUpdate(match, updates, root, args, context, ast) {
    updates.x = 1;
    let db = await root.db;
    await db.collection("updateInfo").remove({});
    await db.collection("updateInfo").insert({ updatedId: match._id, x: updates.x });
  }
  beforeDelete(match, root, args, context, ast) {
    match.userId = 1;
  }
  async afterDelete(match, root, args, context, ast) {
    match.x = 1;
    let db = await root.db;
    await db.collection("deleteInfo").remove({});
    await db.collection("deleteInfo").insert({ deletedId: match._id, x: match.x });
  }
  adjustResults(results) {
    results.forEach(result => {
      if (result.autoAdjustField != null) {
        result.autoAdjustField++;
      }
    });
  }
}

class Type2Hooks {
  queryPreprocess(root, args, context, ast) {
    args.poisonField++;
  }
  queryMiddleware(queryPacket, root, args, context, ast) {
    queryPacket.$match.userId++;
  }
  beforeInsert(obj, root, args, context, ast) {
    if (obj.field1 === "BAD") {
      return false;
    }
    obj.userId++;
  }
  async afterInsert(obj, root, args, context, ast) {
    obj.y++;
    let db = await root.db;

    await db.collection("insertInfo").remove({});
    await db.collection("insertInfo").insert({ insertedId: obj._id + "", y: obj.y });
  }
  beforeUpdate(filters, updates, root, args, context, ast) {
    filters.userId++;
    updates.$inc.autoUpdateField++;
  }
  async afterUpdate(filters, updates, root, args, context, ast) {
    updates.x++;
    let db = await root.db;
    await db.collection("updateInfo").remove({});
    await db.collection("updateInfo").insert({ updatedId: filters._id, x: updates.x });
  }
  beforeDelete(match, root, args, context, ast) {
    match.field1 = { $ne: "XXX" };
  }
  async afterDelete(match, root, args, context, ast) {
    match.x++;
    let db = await root.db;
    await db.collection("deleteInfo").remove({});
    await db.collection("deleteInfo").insert({ deletedId: match._id, x: match.x });
  }
  adjustResults(results) {
    results.forEach(result => {
      if (result.autoAdjustField != null) {
        result.autoAdjustField++;
      }
    });
  }
}

export default {
  Root: HooksRoot,
  Type2: Type2Hooks
};
