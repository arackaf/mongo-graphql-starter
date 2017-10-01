const del = require("del");

try {
  del.sync("test/testProject1/graphQL");
} catch (e) {}

require = require("@std/esm")(module, { esm: "js", cjs: true });
require("./createTestProjects.js");
