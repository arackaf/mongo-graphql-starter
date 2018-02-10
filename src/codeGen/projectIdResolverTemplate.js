  async ${targetObjName}(obj, args, context, ast) {
    if (context["${dataLoaderId}"] == null) {
      let db = await context.__mgqlsdb;
      context["${dataLoaderId}"] = new DataLoader(async keys => {
        let $match = { _id: { $in: keys.filter(id => id).map(id => ObjectId(id)) } };
        let queryPacket = decontructGraphqlQuery(args, ast, ${targetTypeName}Metadata, "${targetObjName}");
        let { $project, $sort, $limit, $skip } = queryPacket;

        let aggregateItems = [
          { $match }, 
          { $project },
        ];

        let results = await dbHelpers.runQuery(db, ${targetTypeName}s, aggregateItems);
        let DestinationMap = new Map([]);

        for (let ${targetTypeNameLower} of results) {
          DestinationMap.set("" + ${targetTypeNameLower}._id, ${targetTypeNameLower});
        }
    
        return keys.map(_id => DestinationMap.get(_id) || null);
      });

      context["${dataLoaderId}"].load(obj.${fkField});
    }
  }