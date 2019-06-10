import createTypeSchemaHelpers from "./typeSchemaHelpers";

export default function createGraphqlTypeSchema(objectToCreate) {
  let manualQueryArgs = [];
  let extras = objectToCreate.extras || {};
  let schemaSources = extras.schemaSources || [];

  let { createSchemaTypes, createMutationType, createQueryType } = createTypeSchemaHelpers(objectToCreate);

  if (Array.isArray(objectToCreate.manualQueryArgs)) {
    manualQueryArgs.push(...objectToCreate.manualQueryArgs.map(arg => `${arg.name}: ${arg.type}`));
  }

  let imports = schemaSources.map((src, i) => `import SchemaExtras${i + 1} from "${src}";`);

  const mutation = () => `\nexport const mutation = \`\n\n${createMutationType()}\n\n\`;`;
  const query = () => `export const query = \`\n\n${createQueryType()}\n\n\`;`;

  return `${imports.length ? imports.join("\n") + "\n\n" : ""}export const type = \`
  
${createSchemaTypes()}
  
\`;
  
  ${objectToCreate.table ? `${mutation()}\n\n${query()}` : ""}
  
`;
}
