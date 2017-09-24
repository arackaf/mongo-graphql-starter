import path from "path";

import { createGraphqlSchema } from "../index";

createGraphqlSchema(import("./project/schema.js"), path.resolve("./project"));
