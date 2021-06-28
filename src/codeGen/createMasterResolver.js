import { TAB, TAB2 } from "./utilities";

export default function createMasterResolver(namesWithTables, writeableNames, resolverAdditions) {
  let resolverImports = namesWithTables.map(n => `import ${n}, { ${n} as ${n}Rest } from './${n}/resolver';`).join("\n");
  let resolverDestructurings = "const " + namesWithTables.map(n => `{ Query: ${n}Query, Mutation: ${n}Mutation } = ${n}`).join(";\nconst ") + ";";
  let resolverAdditionImports = resolverAdditions.map((n, i) => `import resolverAddition${i + 1} from '${n}';`).join("\n");
  let resolverAdditionDestructurings = resolverAdditions
    .map(
      (n, i) =>
        `const { Query: queryAddition${i + 1} = {}, Mutation: mutationAddition${i + 1} = {}, ...restAdditions${i + 1} } = resolverAddition${i + 1};`
    )
    .join("\n");

  return `${[
    "import GraphQLJSON from 'graphql-type-json';",
    resolverImports,
    resolverAdditionImports,
    resolverDestructurings,
    resolverAdditionDestructurings
  ].join("\n\n")}

export default {
  JSON: GraphQLJSON,
  Query: Object.assign(
  {},
  ${[...namesWithTables.map(n => `${n}Query`), resolverAdditions.map((n, i) => `queryAddition${i + 1}`)].join(`,\n`)}
  ),
  ${
    writeableNames.length
      ? `Mutation: Object.assign({},
${[...writeableNames.map(n => `${n}Mutation`), ...resolverAdditions.map((n, i) => `mutationAddition${i + 1}`)].join(",\n")}
),`
      : ""
  }
${[...namesWithTables.map(n => `${n}: { ...${n}Rest }`), ...resolverAdditions.map((n, i) => `...restAdditions${i + 1}`)].join(`,\n  `)}
};

`;
}
