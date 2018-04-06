const shortCircuitHooks = new Set(["beforeInsert", "beforeUpdate", "beforeDelete"]);

export default async function processHook(hooks, TypeName, hookName, ...args) {
  let rootHooks = hooks.Root;
  let typeHooks = hooks[TypeName];
  if (rootHooks) {
    try {
      if (typeof rootHooks === "function") {
        rootHooks = new rootHooks();
      }
      if (rootHooks[hookName]) {
        let res = await rootHooks[hookName](...args);
        if (shortCircuitHooks.has(hookName) && res === false) {
          return false;
        }
      }
    } catch (err) {
      throw `The following error happened in root hook method ${hookName}: ${err.toString()}`;
    }
  }
  if (typeHooks) {
    try {
      if (typeof typeHooks === "function") {
        typeHooks = new typeHooks();
      }
      if (typeHooks[hookName]) {
        let res = await typeHooks[hookName](...args);
        if (shortCircuitHooks.has(hookName) && res === false) {
          return false;
        }
      }
    } catch (err) {
      throw `The following error happened in hook method ${hookName} for type ${TypeName}: ${err.toString()}`;
    }
  }
}
