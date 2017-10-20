const del = require("del");

try {
  del.sync("test/testProject1/graphQL");
  del.sync("test/testProject2/graphQL");
} catch (e) {}

require = require("@std/esm")(module, { esm: "js", cjs: true });
require("./createTestProjects.js");
