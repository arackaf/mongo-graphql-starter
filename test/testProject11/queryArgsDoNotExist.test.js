import spinUp from "./spinUp";

let db, schema, runQuery, runMutation, close;
beforeAll(async () => {
  ({ db, schema, runQuery, runMutation, close } = await spinUp());
});

const nonQueryableFields = ["_id", "str", "strArr"];

nonQueryableFields.forEach(field => {
  test("Non queryable field " + field + " has no search args in all query", async () => {
    const schema = await runQuery({
      query: `
        {
          __schema {
            queryType {
              fields {
                name
                args {
                  name
                }
              }
            }
          }
        }
      `,
      coll: "__schema"
    });

    const allBooksArgs = schema.queryType.fields.find(field => field.name === "allBooks").args.map(arg => arg.name);

    const foundArgs = allBooksArgs.filter(p => p.startsWith(field));

    expect(foundArgs.length).toBe(0);
  });
});
