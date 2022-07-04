import spinUp from "./spinUp";
import JSON5 from "json5";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("thing1").deleteMany({});
});

afterAll(() => {
  close();
  db = null;
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

const fullThing1 = {
  nonNullString: "a",
  nonNullStringArray: [],
  nonNullStringArrayOfNonNull: [],

  nonNullMongoId: "625b73ae4f45cbd7fb1a16e6",
  nonNullMongoIdArray: [],
  nonNullMongoIdArrayOfNonNull: [],

  nonNullInt: 1,
  nonNullIntArray: [],
  nonNullIntArrayOfNonNull: [],

  nonNullFloat: 1.1,
  nonNullFloatArray: [],
  nonNullFloatArrayOfNonNull: [],

  nonNullDate: "1/1/2000",

  nonNullObject: { id: "1" },
  nonNullArrayOfObjects: [],
  nonNullArrayOfNonNullObjects: []
};

test("Create minimal Thing1", async () => {
  let obj = await runMutation({
    mutation: `createThing1(Thing1: ${JSON5.stringify(fullThing1, { quote: '"' })}) { success } `,
    rawResult: "createThing1"
  });

  expect(obj).toEqual({ success: true });
});

for (let k of Object.keys(fullThing1)) {
  if (/Array$/.test(k)) {
  } else if (/ArrayOfNonNull$/.test(k)) {
  } else {
    test(`Create minimal Thing1 - replace ${k}`, async () => {
      const thingObj = Object.assign({}, fullThing1);
      thingObj[k] = null;

      await runMutation({
        mutation: `createThing1(Thing1: ${JSON5.stringify(thingObj, { quote: '"' })}) { success } `,
        expectedError: /null/
      });
    });
    break;
  }
}
