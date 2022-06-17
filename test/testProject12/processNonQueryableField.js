export async function processField({ field, queries }, getGraphqlHelpers) {
  const queryable = field;
  const nonqueryable = `n${field}`;

  queries.forEach(({ args, value }) => {
    args.forEach(arg => {
      test("Testing queryable " + (arg || "match"), async () => {
        const { queriesWithoutError } = await getGraphqlHelpers();
        queriesWithoutError({
          query: `{allThing1s(${queryable}${arg}: ${value}) { Thing1s { _id } }}`
        });
      });

      test("Testing non-queryable " + (arg || "match"), async () => {
        const { queryFails } = await getGraphqlHelpers();
        queryFails({
          query: `{allThing1s(${nonqueryable}${arg}: ${value}) { Thing1s { _id } }}`
        });
      });
    });
  });
}
