import spinUp from "./spinUp";

let db, schema, runQuery, runMutation, close;
beforeAll(async () => {
  ({ db, schema, runQuery, runMutation, close } = await spinUp());
});

afterAll(() => {
  close();
  db = null;
});

async function verifyArgs(query, prefix, expectedArgs) {
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

  const allArgs = schema.queryType.fields.find(field => field.name === query).args.map(arg => arg.name);

  const foundArgs = allArgs.filter(p => p.startsWith(prefix));

  expect(foundArgs.sort()).toEqual(expectedArgs.map(postFix => `${prefix}${postFix ? "_" + postFix : ""}`).sort());
  expect(foundArgs.length).toBe(expectedArgs.length);
}

const testRuns = [
  ["allThing2s", "string1", ["", "startsWith"]],
  ["allThing2s", "string2", []],
  ["allThing2s", "string3", ["endsWith"]],
  ["allThing2s", "bool1", ["", "in", "nin"]],
  ["allThing2s", "intArr1", ["count", "contains", ""]],
  ["allThing2s", "intArr2", ["count", "contains", ""]]
];

testRuns.forEach((runArgs, idx) => {
  test(`Whitelist args ${idx + 1}`, async () => {
    await verifyArgs(...runArgs);
  });
});
