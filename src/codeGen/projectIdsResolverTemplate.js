  async ${targetObjName}(obj, args, context, ast) {
    if (context.${dataLoaderId} == null) {
      let db = await context.__mgqlsdb;
      context.${dataLoaderId} = new DataLoader(async keyArrays => {
        let $match = { _id: { $in: flatMap(keyArrays || [], ids => ids.map(id => ObjectId(id))) } };
        let queryPacket = decontructGraphqlQuery(args, ast, ${targetTypeName}Metadata, constants.useCurrentSelectionSet);
        let { $project, $sort, $limit, $skip } = queryPacket;
        
        let aggregateItems = [
          { $match }, 
          { $project },
        ];
        let results = await dbHelpers.runQuery(db, "${table}", aggregateItems);

        let destinationMap = new Map([]);
        for (let obj of results) {
          destinationMap.set("" + obj._id, obj)
        }
        return keyArrays.map(keyArray => keyArray.map(_id => destinationMap.get("" + _id)).filter(o => o));
      });
    }
    return context.${dataLoaderId}.load(obj.${fkField} || []);
  }