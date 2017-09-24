import path from "path";

export default function(source, destPath) {
  Promise.resolve(source).then(module => {
    Object.keys(module).forEach(k => console.log(k));

    console.log(path.resolve("project/schema.js", "."));
  });
}
