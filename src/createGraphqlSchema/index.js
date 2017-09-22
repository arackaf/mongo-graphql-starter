export default function(sourcePath, destPath) {
  import(sourcePath).then(module => {
    Object.keys(module).forEach(k => console.log(k));
  });
}
