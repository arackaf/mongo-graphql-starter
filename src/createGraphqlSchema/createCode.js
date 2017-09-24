const TAB = "  "; //two spaces

export function createObject(declaration, properties, offset = 1) {
  let propertyTab = TAB.repeat(offset),
    declarationTab = TAB.repeat(offset - 1);

  return `
${declarationTab}${declaration}
${properties.map(({ name, value }) => `${propertyTab}${name}: ${value}`).join(",\n")}
${declarationTab}}`.trim();
}
