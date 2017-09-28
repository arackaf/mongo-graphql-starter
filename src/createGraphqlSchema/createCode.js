const TAB = "  "; //two spaces

export function createObject(declaration, properties, offset = 1) {
  let propertyTab = TAB.repeat(offset),
    declarationTab = TAB.repeat(offset - 1);

  return `
${declarationTab}${declaration}
${createProperties(properties, offset)}
${declarationTab}}`.trim();
}

function createProperties(properties, offset) {
  let propertyTab = TAB.repeat(offset),
    nestedObjTab = TAB.repeat(offset + 1);
  return properties
    .map(({ name, value }) => {
      return `${propertyTab}${name}: ${Array.isArray(value)
        ? `[\n${nestedObjTab}${createObject("{", value, offset + 2)}\n${propertyTab}]`
        : displayValue(value)}`;
    })
    .join(",\n");
}

function displayValue(value) {
  if (typeof value === "string") {
    return `"${value}"`;
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `"[${value.type.__name}]"`;
    } else if (value.__isObject) {
      return `"${value.type.__name}"`;
    }
  }
}

//${properties.map(({ name, value }) => `${propertyTab}${name}: ${value}`).join(",\n")}
