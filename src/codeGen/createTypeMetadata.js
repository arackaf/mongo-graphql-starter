import {
  MongoIdType,
  StringType,
  IntType,
  FloatType,
  DateType,
  arrayOf,
  StringArrayType,
  MongoIdArrayType,
  IntArrayType,
  FloatArrayType
} from "../dataTypes";
import { TAB } from "./utilities";

const defaultDateFormat = "%m/%d/%Y";

export default function createOutputTypeMetadata(objectToCreate) {
  let fields = objectToCreate.fields;
  let relationships = objectToCreate.relationships;
  let extras = objectToCreate.extras;

  let types = new Set([]);

  Object.keys(fields).forEach(k => {
    let packet = fields[k];
    if (packet.__isArray || packet.__isObject) {
      types.add(packet.type.__name);
    }
  });

  if (typeof relationships === "object") {
    Object.keys(relationships).forEach(k => types.add(relationships[k].type.__name));
  }

  let imports = types.size ? [...types].map(n => `import ${n} from "../${n}/${n}";`).join("\n") + "\n\n" : "";

  return (
    createObject(
      imports + "export default {",
      [
        objectToCreate.table
          ? {
              name: "table",
              value: objectToCreate.table
            }
          : null,
        {
          name: "typeName",
          value: objectToCreate.__name
        },
        {
          name: "fields",
          value: Object.keys(fields).map(k => {
            let entry = fields[k];
            if (entry === DateType || (typeof entry === "object" && entry.__isDate)) {
              return {
                name: k,
                value: createObject(
                  "{",
                  [
                    {
                      name: "__isDate",
                      value: true,
                      literal: true
                    },
                    {
                      name: "format",
                      value: entry.format || defaultDateFormat
                    }
                  ],
                  3
                ),
                literal: true
              };
            } else if (typeof entry === "object" && (entry.__isArray || entry.__isObject)) {
              return {
                name: k,
                value: createObject(
                  "{",
                  [
                    { name: entry.__isArray ? "__isArray" : "__isObject", value: true, literal: true },
                    { definition: "get type(){ return " + entry.type.__name + "; }" }
                  ],
                  3
                ),
                literal: true
              };
            } else {
              return {
                name: k,
                value: fields[k]
              };
            }
          })
        },
        extras
          ? {
              name: "extras",
              value: createObject(
                "{",
                ["resolverSources", "schemaSources", "overrides"]
                  .map(prop => (extras[prop] ? { name: prop, value: `[${extras[prop].map(s => `"${s}"`).join(", ")}]`, literal: true } : null))
                  .filter(o => o),
                2
              ),
              literal: true
            }
          : null,
        relationships
          ? {
              name: "relationships",
              value: Object.keys(relationships).map(k => {
                let relationship = relationships[k];
                let isOne = relationship.__isObject;

                return {
                  name: k,
                  value: createObject(
                    "{",
                    [
                      { definition: "get type(){ return " + relationship.type.__name + "; }" },
                      { definition: `fkField: "${relationship.fkField}"` },
                      { definition: `keyField: "${relationship.keyField}"` },
                      relationship.oneToOne ? { definition: `oneToOne: true` } : null,
                      relationship.oneToMany ? { definition: `oneToMany: true` } : null,
                      relationship.manyToMany ? { definition: `manyToMany: true` } : null,
                      { definition: `__isArray: ${relationship.__isArray}` },
                      { definition: `__isObject: ${relationship.__isObject}` }
                    ].filter(o => o),
                    3
                  ),
                  literal: true
                };
              }),
              literal: true
            }
          : null
      ].filter(o => o)
    ) + ";"
  );
}

function createObject(declaration, properties, offset = 1) {
  let propertyTab = TAB.repeat(offset);
  let declarationTab = TAB.repeat(offset - 1);

  return `
  ${declarationTab}${declaration}
${createProperties(properties, offset)}
${declarationTab}}`.trim();
}

function createProperties(properties, offset) {
  let propertyTab = TAB.repeat(offset);

  return properties
    .filter(prop => prop)
    .map(({ name, value, literal, definition }) => {
      return (
        propertyTab +
        (definition || `${name}: ${Array.isArray(value) ? `${createObject(" {", value, offset + 1)}` : displayMetadataValue(value, literal)}`)
      );
    })
    .join(",\n");
}

function displayMetadataValue(value, literal) {
  if (literal) {
    return value;
  } else if (typeof value === "string") {
    return `"${value}"`;
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `"[${value.type.__name}]"`;
    } else if (value.__isLiteral) {
      return `"${value.type}"`;
    } else if (value.__isObject) {
      return `"${value.type.__name}"`;
    }
  }
}
