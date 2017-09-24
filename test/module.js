import path from "path";

import { createGraphqlSchema } from "../index";

//console.log(path.normalize("project/schema.js"));
console.log(path.resolve("./project/schema.js"));

createGraphqlSchema(import("./project/schema.js"));
