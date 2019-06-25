import fs from "fs";
import path from "path";
import { buildSchema, printSchema, parse } from "graphql";

import { codegen } from "@graphql-codegen/core";
import { plugin as typescriptPlugin } from "@graphql-codegen/typescript";
import { plugin as typescriptOperationsPlugin } from "@graphql-codegen/typescript-operations";

const additionalTypes = fs.readFileSync(path.resolve(__dirname, "./typeScriptHelperTypes.txt"), { encoding: "utf8" });

export default async function createTypeScriptTypes(schemaText, outputFile) {
  const schema = buildSchema(schemaText);

  const config = {
    // used by a plugin internally, although the 'typescript' plugin currently returns the string output, rather than writing to a file
    filename: outputFile,
    schema: parse(printSchema(schema)),
    plugins: [{ typescript: { skipTypename: true, avoidOptionals: true } }, { typescriptOperations: {} }],
    documents: [], //needed, for now
    pluginMap: {
      typescript: {
        plugin: typescriptPlugin
      },
      typescriptOperations: {
        plugin: typescriptOperationsPlugin
      }
    }
  };

  const output = await codegen(config);
  fs.writeFileSync(outputFile, additionalTypes + "\n\n" + output);

  console.log("TypeScript Types Generated!");
}
