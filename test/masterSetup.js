const del = require("del");
require = require("@std/esm")(module, { esm: "js", cjs: true });

module.exports = async function() {
  try {
    del.sync("test/testProject1/graphQL");
    del.sync("test/testProject2/graphQL");
    del.sync("test/testProject3/graphQL");
    del.sync("test/testProject4/graphQL");
    del.sync("test/testProject5/graphQL");
    del.sync("test/testProject6/graphQL");
    del.sync("test/testProject7/graphQL");
    del.sync("test/testProject8/graphQL");
  } catch (e) {}

  require("./createTestProjects.js");
};
