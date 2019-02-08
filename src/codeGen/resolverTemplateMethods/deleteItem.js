import { mutationStart, mutationError, mutationOver, mutationMeta, mutationComplete } from "../mutationHelpers";

export default ({ objName, table, relationshipCleanup }) => `    async delete${objName}(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      ${mutationStart({ objName, op: "delete" })}
      try {
        let $match = { _id: ObjectId(args._id) };
        
        if (await processHook(hooksObj, "${objName}", "beforeDelete", $match, { ...gqlPacket, db, session }) === false) {
          return { success: false };
        }
        await dbHelpers.runDelete(db, "${table}", $match);
        await processHook(hooksObj, "${objName}", "afterDelete", $match, { ...gqlPacket, db, session });
        ${relationshipCleanup}

        ${mutationComplete()}
        return {
          success: true,
          ${mutationMeta()} 
        };
      } ${mutationError()} ${mutationOver()}
    }`;
