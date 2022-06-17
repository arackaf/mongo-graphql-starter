import spinUp from "./spinUp";

let db, schema, runQuery, runMutation, close;
beforeAll(async () => {
  ({ db, schema, runQuery, runMutation, close } = await spinUp());
});

afterAll(() => {
  close();
  db = null;
});

const nonQueryableFields = ["_id", "str", "strArr", "bool", "int", "intArr", "float", "floatArr", "date", "json"];

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

    const foundArgs = allBooksArgs.filter(p => p.startsWith(field) && p !== "date_format");

    expect(foundArgs.length).toBe(0);
  });
});
