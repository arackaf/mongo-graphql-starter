async function get${targetTypeName}sFor${sourceObjName}(db, ${sourceParam}){
  let $match = { _id: { $in: ${sourceParam}.${fkField}.map(_id => ObjectId(_id)) } });
  let $project = {};

  let aggregateItems = [{ $match }, { $project }];

  ${sourceParam}.${targetObjName} = await db
    .collection("${table}")
    .aggregate(aggregateItems)
    .toArray();
} 
