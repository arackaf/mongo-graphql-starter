export default {
  queryPreprocess(root, args, context, ast) {
    args.poisonField = 1;
  },
  queryMiddleware(queryPacket, root, args, context, ast) {
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
  Type2: {
    queryPreprocess(root, args, context, ast) {
      //
    },
    queryMiddleware(queryPacket, root, args, context, ast) {
      //
    }
  }
};
