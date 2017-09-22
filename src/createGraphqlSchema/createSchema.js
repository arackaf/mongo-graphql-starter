export default function(source, destPath) {
  Promise.resolve(source).then(module => {
    Object.keys(module).forEach(k => console.log(k));
  });
}
