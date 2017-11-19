  if (${sourceObjName}s.length && queryPacket.extrasPackets.has("${targetObjName}")) {
    let $match = { _id: { $in: flatMap(${sourceObjName}s.map(${objNameLower} => ${objNameLower}.${fkField} || []), ids => ids.map(id => ObjectId(id))) } };  
    let $project = {};

    let results = await load${targetTypeName}s(db, { 
      $match,
      ...queryPacket.extrasPackets.get("${targetObjName}")
    });

    let ${targetTypeNameLower}DestinationMap = new Map([]);

    for (let ${targetTypeNameLower} of results) {
      ${targetTypeNameLower}DestinationMap.set("" + ${targetTypeNameLower}._id, ${targetTypeNameLower});
    }

    for (let ${objNameLower} of ${sourceObjName}s) {
      ${objNameLower}.${targetObjName} = ${targetTypeNameLower}DestinationMap.get(${objNameLower}.${fkField}) || null;
    }
  }