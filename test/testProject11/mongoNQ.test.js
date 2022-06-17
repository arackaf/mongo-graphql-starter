import { processField } from "./processNonQueryableField";

processField({
  field: "q__id",
  queries: [
    {
      args: ["", "_ne"],
      value: '"6164d3d577f54f44209b7941"'
    },
    {
      args: ["_in", "_nin"],
      value: '["6164d3d577f54f44209b7941"]'
    }
  ]
});
