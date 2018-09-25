export function getMongoProjection(requestMap, objectMetaData, args, extrasPackets) {
  return getProjectionObject(requestMap, objectMetaData, args, extrasPackets);
}
function getProjectionObject(requestMap, objectMetaData, args = {}, extrasPackets, currentObject = "", increment = 0) {
  let allRelationships = objectMetaData.relationships || {};

  let result = [...requestMap.entries()].reduce((hash, [field, selectionEntry]) => {
    let entry = objectMetaData.fields[field];
    if (!entry) {
      if (allRelationships[field]) {
        let fkField = allRelationships[field].fkField;
        hash[fkField] = currentObject ? currentObject + "." + fkField : "$" + fkField;
      }
      return hash;
    }

    if (selectionEntry === true) {
      if (entry.__isDate) {
        let format = args[field + "_format"] || entry.format;
        hash[field] = { $dateToString: { format, date: currentObject ? currentObject + "." + field : "$" + field } };
      } else {
        hash[field] = currentObject ? currentObject + "." + field : "$" + field;
      }
    } else if (entry.__isArray) {
      let currentObjName = "item" + (increment || "");
      hash[field] = {
        $map: {
          input: currentObject ? currentObject + "." + field : "$" + field,
          as: currentObjName,
          in: getProjectionObject(selectionEntry, entry.type, {}, null, "$$" + currentObjName, increment + 1)
        }
      };
    } else {
      hash[field] = getProjectionObject(selectionEntry, entry.type, {}, null, currentObject ? currentObject + "." + field : "$" + field, increment);
    }
    return hash;
  }, {});

  return result;
}

export function parseRequestedFields(ast, queryName, force) {
  let { requestMap } = getNestedQueryInfo(ast, queryName);
  if (force) {
    force.forEach(field => requestMap.set(field, true));
  }
  return requestMap;
}

export function parseRequestedHierarchy(ast, requestMap, type, args = {}, anchor) {
  let extrasPackets = new Map([]);

  if (type.relationships) {
    Object.keys(type.relationships).forEach(name => {
      let relationship = type.relationships[name];
      let { ast: astNew, requestMap } = getNestedQueryInfo(ast, anchor === "string" ? anchor + "." + name : name);

      if (requestMap.size) {
        extrasPackets.set(name, parseRequestedHierarchy(astNew, requestMap, relationship.type));
      }
    });
  }

  return {
    extrasPackets,
    requestMap,
    $project: requestMap.size ? getMongoProjection(requestMap, type, args, extrasPackets) : null
  };
}

function getNestedQueryInfo(ast, queryName) {
  let fieldNode = ast.fieldNodes ? ast.fieldNodes.find(fn => fn.kind == "Field") : ast;

  if (queryName) {
    for (let path of queryName.split(".")) {
      if (!fieldNode) {
        break;
      }
      fieldNode = fieldNode.selectionSet.selections.find(fn => fn.kind == "Field" && fn.name && fn.name.value == path);
    }
  }

  if (fieldNode) {
    return {
      requestMap: getSelections(fieldNode),
      ast: fieldNode
    };
  } else {
    return {
      requestMap: new Map(),
      ast: null
    };
  }
}

function getSelections(fieldNode) {
  return new Map(fieldNode.selectionSet.selections.map(sel => [sel.name.value, sel.selectionSet == null ? true : getSelections(sel)]));
}
