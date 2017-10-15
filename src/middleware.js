const middlewares = [];

export default {
  use: middleware => middlewares.push(middleware),
  clearAll: () => (middlewares.length = 0),
  process: (deconstructedQuery, root, args, context, ast) => {
    if (middlewares.length) {
      return Promise.resolve(runIt(middlewares[0], middlewares.slice(1), deconstructedQuery, root, args, context, ast)).then(
        () => deconstructedQuery
      );
    } else {
      return deconstructedQuery;
    }
  }
};

function runIt(method, rest, deconstructedQuery, root, args, context, ast) {
  Promise.resolve(method(deconstructedQuery, root, args, context, ast)).then(() => {
    if (rest.length) {
      runIt(rest[0], rest.slice(1), deconstructedQuery, root, args, context, ast);
    }
  });
}
