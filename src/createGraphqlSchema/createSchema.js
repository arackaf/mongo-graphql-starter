import path from "path";
import fs from "fs";

export default function(source, destPath) {
  Promise.resolve(source).then(module => {
    let dir = path.relative(destPath, "upload");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    Object.keys(module).forEach(k => {
      console.log(k);
    });
  });
}
