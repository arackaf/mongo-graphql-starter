export default function createMasterResolver(namesWithTables) {
  let resolverImports = namesWithTables.map(n => `import ${n} from './${n}/resolver';`).join("\n");
  let resolverDestructurings =
    "const " + namesWithTables.map(n => `{ Query: ${n}Query, Mutation: ${n}Mutation, ...${n}Rest } = ${n}`).join(";\nconst ") + ";";

  return `${resolverImports}\n\n${resolverDestructurings}

export default {
Query: Object.assign({},
${namesWithTables.map(n => `${n}Query`).join(",\n    ")}
),
Mutation: Object.assign({},
${namesWithTables.map(n => `${n}Mutation`).join(",\n    ")}
),
${namesWithTables.map(n => `...${n}Rest`).join(",\n  ")}
};

`;
}
