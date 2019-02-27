const tabs = num => Array.from({ length: num }, () => "  ").join("");

export const mutationStart = ({ objName, op }) =>
  `let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "${objName}", ${objName}Metadata, { ${op}: true });`;

export const mutationComplete = () => `await resolverHelpers.mutationComplete(session, transaction);`;

export const mutationError = () =>
  `catch (err) {
        await resolverHelpers.mutationError(err, session, transaction);
        return { success: false };
      }`;

export const mutationOver = () => `finally { 
        resolverHelpers.mutationOver(session);
      }`;

export const mutationMeta = () => `Meta: {
  ${tabs(5)}transaction,
  ${tabs(5)}elapsedTime: 0
  ${tabs(4)}}`;
