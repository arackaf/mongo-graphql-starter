export const getDbObjects = () => `let { db, client, session, transaction } = await resolverHelpers.startDbMutation(root, context);`;

export const mutationComplete = () => `await resolverHelpers.mutationComplete(session, transaction);`;

export const mutationError = () =>
  `catch (err) {
        await resolverHelpers.mutationError(err, session, transaction);
      }`;

export const mutationOver = () => `finally { 
        resolverHelpers.mutationOver(session);
      }`;
