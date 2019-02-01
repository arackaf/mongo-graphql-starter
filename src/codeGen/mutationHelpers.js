const tabs = num => Array.from({ length: num }, () => "  ").join("");

export const getDbObjects = () => `let { db, client, session, transaction } = await resolverHelpers.startDbMutation(root, context);`;

export const mutationComplete = () => `await resolverHelpers.mutationComplete(session, transaction);`;

export const mutationError = () =>
  `catch (err) {
        await resolverHelpers.mutationError(err, session, transaction);
      }`;

export const mutationOver = () => `finally { 
        resolverHelpers.mutationOver(session);
      }`;

export const mutationMeta = ()=> `Meta: {
  ${tabs(5)}transaction,
  ${tabs(5)}elapsedTime: 0
  ${tabs(4)}}`