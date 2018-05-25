export async function load${objName}s(db, queryPacket, root, args, context, ast) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    $sort ? { $sort } : null, 
    { $project },
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  await processHook(hooksObj, "${objName}", "queryPreAggregate", aggregateItems, root, args, context, ast);
  let ${objName}s = await dbHelpers.runQuery(db, "${table}", aggregateItems);
  await processHook(hooksObj, "${objName}", "adjustResults", ${objName}s);
  return ${objName}s;
}

export const ${objName} = {
${relationshipResolvers}
${typeExtras}
}

export default {
  Query: {
${queryItems}
  },
  Mutation: {
${mutationItems}
  }
};
