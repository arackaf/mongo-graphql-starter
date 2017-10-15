const preprocessors = [];

export default {
  use: preprocessor => preprocessors.push(preprocessor),
  clearAll: () => (preprocessors.length = 0),
  process: (root, args, context, ast) => {
    if (preprocessors.length) {
      return Promise.resolve(runIt(preprocessors[0], preprocessors.slice(1), root, args, context, ast));
    }
  }
};

function runIt(method, rest, root, args, context, ast) {
  Promise.resolve(method(root, args, context, ast)).then(() => {
    if (rest.length) {
      runIt(rest[0], rest.slice(1), root, args, context, ast);
    }
  });
}
