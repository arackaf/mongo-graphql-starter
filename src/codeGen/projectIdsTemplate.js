  if (${sourceObjName}s.length && queryPacket.extrasPackets.has("${targetObjName}")) {
    let $match = { _id: { $in: flatMap(${sourceObjName}s.map(${objNameLower} => ${objNameLower}.${fkField} || []), ids => ids.map(id => ObjectId(id))) } };  
    let $project = {};

    let results = await load${targetTypeName}s(db, { 
      $match,
      ...queryPacket.extrasPackets.get("${targetObjName}")
    });

    let ${targetTypeNameLower}DestinationMap = new Map([]);

    for (let ${objNameLower} of ${sourceObjName}s) {
      ${objNameLower}.${targetObjName} = [];
      if (${objNameLower}.${fkField}) {
        for (let _id of ${objNameLower}.${fkField}) {
          if (!${targetTypeNameLower}DestinationMap.has("" + _id, )){
            ${targetTypeNameLower}DestinationMap.set("" + _id, []);
          }
          ${targetTypeNameLower}DestinationMap.get("" + _id).push(${objNameLower}.${targetObjName});
        }
      }
    }

    for (let ${targetTypeNameLower} of results) {
      if (${targetTypeNameLower}DestinationMap.has("" + ${targetTypeNameLower}._id)) {
        for (let targetArr of ${targetTypeNameLower}DestinationMap.get("" + ${targetTypeNameLower}._id)) {
          targetArr.push(${targetTypeNameLower});
        }
      }
    }
  }