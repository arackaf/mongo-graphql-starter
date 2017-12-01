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
  beforeMutate(filter, updates, root, args, context, ast) {
    filter.userId = 1;
    if (!updates.$inc) {
      updates.$inc = {};
    }
    updates.$inc.autoUpdateField = 1;
  },
  beforeMutate(filter, updates, root, args, context, ast) {
    filter.userId = 1;
    if (!updates.$inc) {
      updates.$inc = {};
    }
    updates.$inc.autoUpdateField = 1;
  },
  beforeInsert(obj, root, args, context, ast) {
    obj.userId = 1;
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
      //
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
