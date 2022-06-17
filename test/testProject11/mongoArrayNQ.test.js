import { processField } from "./processNonQueryableField";

processField({
  field: "q__id_arr",
  queries: [
    {
      args: ["_contains"],
      value: '"6164d3d577f54f44209b7941"'
    },
    {
      args: ["", "_containsAny", "_containsAll", "_ne"],
      value: '["6164d3d577f54f44209b7941"]'
    },
    {
      args: ["_in", "_nin"],
      value: '[["6164d3d577f54f44209b7941"]]'
    }
  ]
});
