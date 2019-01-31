export const getDbObjects = () =>
  `
      let { db, client } = root;
      db = await (typeof db === "function" ? db() : db);
      client = await (typeof client === "function" ? client() : client);
      context.__mongodb = db;
`.trim();
