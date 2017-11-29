export async function queryPreprocess(hooks, TypeName, root, args, context, ast) {
  if (hooks.queryPreprocess) {
    await hooks.queryPreprocess(root, args, context, ast);

    if (hooks[TypeName] && hooks[TypeName].queryPreprocess) {
      await hooks[TypeName].queryPreprocess(root, args, context, ast);
    }
  }
}
