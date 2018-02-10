  async ${targetObjName}(obj, args, context, ast) {
    if (context.${dataLoaderId} == null) {
      let db = await context.__mgqlsdb;
      context.${dataLoaderId} = new DataLoader(async keys => {
        let $match = { _id: { $in: keys.filter(id => id).map(id => ObjectId(id)) } };
        let queryPacket = decontructGraphqlQuery(args, ast, ${targetTypeName}Metadata, constants.useCurrentSelectionSet);
        let { $project, $sort, $limit, $skip } = queryPacket;

        let aggregateItems = [
          { $match }, 
          { $project },
        ];
        let results = await dbHelpers.runQuery(db, "${table}", aggregateItems);

        let destinationMap = new Map([]);
        for (let result of results) {
          destinationMap.set("" + result._id, result);
        }
        return keys.map(_id => destinationMap.get("" + _id) || null);
      });
    }
    return context.${dataLoaderId}.load(obj.${fkField});
  }