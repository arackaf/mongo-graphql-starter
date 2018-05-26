  async ${targetObjName}(obj, args, context, ast) {
    if (context.${dataLoaderId} == null) {
      let db = await context.__mongodb;
      context.${dataLoaderId} = new DataLoader(async keyArrays => {
        let $match = { _id: { $in: flatMap(keyArrays || [], ids => ids.map(id => ObjectId(id))) } };
        let queryPacket = decontructGraphqlQuery(args, ast, ${targetTypeName}Metadata, constants.useCurrentSelectionSet);
        let { $project, $sort, $limit, $skip } = queryPacket;
        
        let aggregateItems = [
          { $match }, 
          $sort ? { $sort } : null,
          { $project },
        ].filter(item => item);
        let results = await dbHelpers.runQuery(db, "${table}", aggregateItems);

        let finalResult = keyArrays.map(keyArr => []);
        let keySets = keyArrays.map(keyArr => new Set(keyArr.map(_id => "" + _id)));

        for (let result of results){
          for (let i = 0; i < keyArrays.length; i++){
            if (keySets[i].has(result._id + "")){
              finalResult[i].push(result);
            }
          }
        }
        return finalResult;
      });
    }
    return context.${dataLoaderId}.load(obj.${fkField} || []);
  }