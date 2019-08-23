import createTypeSchemaHelpers from "./typeSchemaHelpers";
import { TAB } from "./utilities";

export default function createGraphqlTypeSchema(objectToCreate) {
  let manualQueryArgs = [];

  let { createSchemaTypes, createMutationType, createQueryType } = createTypeSchemaHelpers(objectToCreate);
  let extras = objectToCreate.extras || {};
  let schemaSources = extras.schemaSources || [];

  if (Array.isArray(objectToCreate.manualQueryArgs)) {
    manualQueryArgs.push(...objectToCreate.manualQueryArgs.map(arg => `${arg.name}: ${arg.type}`));
  }

  let imports = schemaSources.map((src, i) => `import SchemaExtras${i + 1} from "${src}";`);

  let extraMutations = schemaSources.map((src, i) => "\n\n" + TAB + "${SchemaExtras" + (i + 1) + '.Mutation || ""}').join("");
  let extraQueries = schemaSources.map((src, i) => "\n\n" + TAB + "${SchemaExtras" + (i + 1) + '.Query || ""}').join("");

  const mutation = () => `\nexport const mutation = \`\n\n${createMutationType()}${extraMutations}\n\n\`;`;
  const query = () => `export const query = \`\n\n${createQueryType()}${extraQueries}\n\n\`;`;

  return `${imports.length ? imports.join("\n") + "\n\n" : ""}export const type = \`
  
${createSchemaTypes()}
  
\`;
  
  ${objectToCreate.table ? `${mutation()}\n\n${query()}` : ""}
  
`;
}
