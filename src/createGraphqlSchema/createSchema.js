import path from "path";
import fs from "fs";

import { createObject } from "./createCode";

export default function(source, destPath) {
  Promise.resolve(source).then(module => {
    console.log("XXXXXXXXXXcreating in");
    let rootDir = path.join(destPath, "graphQL");
    console.log("!!!!!!!!!!creating in", rootDir);
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir);
    }

    Object.keys(module).forEach(k => {
      let objPath = path.join(destPath, k + ".js");
      if (!fs.existsSync(objPath)) {
        fs.writeFileSync(
          objPath,
          createObject("export const Test = {", [{ name: "a", value: '"value"' }, { name: "b", value: "two" }, { name: "c", value: "three" }])
        );
      }
    });
  });
}
