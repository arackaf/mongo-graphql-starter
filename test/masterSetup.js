const del = require("del");

try {
  del.sync("test/testProject1/graphQL");
  del.sync("test/testProject2/graphQL");
  del.sync("test/testProject3/graphQL");
  del.sync("test/testProject4/graphQL");
  del.sync("test/testProject5/graphQL");
  del.sync("test/testProject6/graphQL");
} catch (e) {}

require = require("@std/esm")(module, { esm: "js", cjs: true });
require("./createTestProjects.js");
