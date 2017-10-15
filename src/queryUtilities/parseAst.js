export const parseRequestedFields = ast => {
  let fieldNode = ast.fieldNodes.find(fn => fn.kind == "Field");
  if (fieldNode) {
    let primitives = fieldNode.selectionSet.selections.filter(sel => sel.selectionSet == null).map(sel => sel.name.value);
    let objectSelections = fieldNode.selectionSet.selections.filter(sel => sel.selectionSet != null).map(sel => sel.name.value);

    return { primitives, objectSelections };
  }
};
