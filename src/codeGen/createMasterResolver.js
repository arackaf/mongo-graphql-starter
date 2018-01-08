import { TAB, TAB2 } from "./utilities";

export default function createMasterResolver(namesWithTables) {
  let resolverImports = namesWithTables.map(n => `import ${n} from './${n}/resolver';`).join("\n");
  let resolverDestructurings =
    "const " + namesWithTables.map(n => `{ Query: ${n}Query, Mutation: ${n}Mutation, ...${n}Rest } = ${n}`).join(";\nconst ") + ";";

  return `${resolverImports}\n\n${resolverDestructurings}

export default {
${TAB}Query: Object.assign(
${TAB2}{},
${TAB2}${namesWithTables.map(n => `${n}Query`).join(`,\n${TAB2}`)}
${TAB}),
${TAB}Mutation: Object.assign({},
${TAB2}${namesWithTables.map(n => `${n}Mutation`).join(`,\n${TAB2}`)}
${TAB}),
${namesWithTables.length ? TAB : ""}${namesWithTables.map(n => `...${n}Rest`).join(`,\n${TAB}`)}
};

`;
}
