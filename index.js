require = require("@std/esm")(module, { esm: "js", cjs: true });

module.exports = Object.assign({}, require("./src/module.js"));
