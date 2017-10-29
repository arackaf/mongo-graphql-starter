import { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf } from "../dataTypes";
import { TAB } from "./utilities";

const defaultDateFormat = "%m/%d/%Y";

export default function createOutputTypeMetadata(objectToCreate) {
  let fields = objectToCreate.fields;
  let types = new Set([]);

  Object.keys(fields).forEach(k => {
    let packet = fields[k];
    if (packet.__isArray || packet.__isObject) {
      types.add(packet.type.__name);
    }
  });

  let imports = types.size ? [...types].map(n => `import ${n} from "../${n}/${n}";`).join("\n") + "\n\n" : "";

  return (
    createObject(imports + "export default {", [
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
      }
    ]) + ";"
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
  let nestedObjTab = TAB.repeat(offset + 1);

  return properties
    .filter(prop => prop)
    .map(({ name, value, literal, definition }) => {
      return (
        propertyTab +
        (definition ||
          `${name}: ${Array.isArray(value) ? `${createObject(" {", value, offset + 1)}${propertyTab}` : displayMetadataValue(value, literal)}`)
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
