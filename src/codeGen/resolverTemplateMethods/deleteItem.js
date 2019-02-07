import { getDbObjects, mutationError, mutationOver, mutationMeta } from "../mutationHelpers";

export default ({ objName, table, relationshipCleanup }) => `    async delete${objName}(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      ${getDbObjects({ objName, op: "delete" })}
      try {
        let $match = { _id: ObjectId(args._id) };
        
        if (await processHook(hooksObj, "${objName}", "beforeDelete", $match, { db, root, args, context, ast, session }) === false) {
          return { success: false };
        }
        await dbHelpers.runDelete(db, "${table}", $match);
        await processHook(hooksObj, "${objName}", "afterDelete", $match, { db, root, args, context, ast, session });
        ${relationshipCleanup}
        return {
          success: true,
          ${mutationMeta()} 
        };
      } ${mutationError()} ${mutationOver()}
    }`;
