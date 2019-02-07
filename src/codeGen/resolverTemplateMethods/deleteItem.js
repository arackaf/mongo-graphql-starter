import { getDbObjects, mutationError, mutationOver, mutationMeta } from "../mutationHelpers";

export default ({ objName, table, relationshipCleanup }) => `    async delete${objName}(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      ${getDbObjects({ objName, op: "delete" })}
      let $match = { _id: ObjectId(args._id) };
      
      if (await processHook(hooksObj, "${objName}", "beforeDelete", $match, root, args, context, ast) === false) {
        return false;
      }
      await dbHelpers.runDelete(db, "${table}", $match);
      await processHook(hooksObj, "${objName}", "afterDelete", $match, root, args, context, ast);
    ${relationshipCleanup}
      return true;
    }`;
