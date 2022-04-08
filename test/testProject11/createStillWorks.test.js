import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

test("Create minimal object", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {
      str: "str",
      strArr: ["strArr"],
      bool: true,
      int: 1,
      intArr: [1, 2],
      float: 1.1,
      floatArr: [1.1, 2.2],
      date: "1/1/2000",
      json: "json",

      queryable_str: "strq",
      queryable_strArr: ["strArrq"],
      queryable_bool: true,
      queryable_int: 2,
      queryable_intArr: [2, 3],
      queryable_float: 1.2,
      queryable_floatArr: [1.2, 2.3],
      queryable_date: "1/1/2001",
      queryable_json: "jsonq",
    }) { Book { 
      str, 
      strArr, 
      bool, 
      int, 
      intArr, 
      float, 
      floatArr, 
      date, 
      json, 
      queryable_str, 
      queryable_strArr, 
      queryable_bool, 
      queryable_int, 
      queryable_intArr, 
      queryable_float, 
      queryable_floatArr, 
      queryable_date, 
      queryable_json 
    } 
  }`,
    result: "createBook"
  });
  expect(obj).toEqual({
    str: "str",
    strArr: ["strArr"],
    bool: true,
    int: 1,
    intArr: [1, 2],
    float: 1.1,
    floatArr: [1.1, 2.2],
    date: "01/01/2000",
    json: "json",

    queryable_str: "strq",
    queryable_strArr: ["strArrq"],
    queryable_bool: true,
    queryable_int: 2,
    queryable_intArr: [2, 3],
    queryable_float: 1.2,
    queryable_floatArr: [1.2, 2.3],
    queryable_date: "01/01/2001",
    queryable_json: "jsonq"
  });
});
