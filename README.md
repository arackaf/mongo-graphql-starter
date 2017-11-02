# mongo-graphql-starter

This utility will scaffold GraphQL schema and resolvers, with queries, filters and mutations working out of the box, based on metadata you enter about your Mongo db.

The idea is to auto-generate the mundane, repetative boilerplate needed for a graphQL endpoint, then get out of your way, leaving you to code your odd or advanced edge cases as needed.

## Prior art

This project is heavily inspired by [Graph.Cool](https://www.graph.cool/).  It's an amazing graphQL-as-a-service that got me hooked immediately on the idea of auto-generating graphQL queries, filters, etc on your data store.  The only thing I disliked about it was that you lose control of your data.  You lack the ability to connect directly to your database and index tune, bulk insert data, bulk update data, etc.  This project aims to provide the best of both worlds: your graphQL endpoint—including queries and mutations—are auto generated, but on top of the database you provide, and by extension retain control of.  Moreover, the graphQL schema and resolvers are generated in such a way that adding your own one-off edge cases is easy, and encouraged.

This project is otherwise unrelated to Graph.Cool.  It is not in any way intended to be—and never will be—a full clone, and any similarities to the APIs generated are incidental.

## How do you use it?

Let's work through a simple example.

First, create your db metadata like this.  Each mongo collection you'd like added to your GraphQL endpoint needs to contain the table name, and all of the fields, keyed off of the data types provided.  If you're creating a type which will only exist inside another type's Mongo fields, then you can omit the table property.

For any type which is contained in a Mongo collection—ie has a `table` property—if you leave off the `_id` field, one will be added for you, of type `MongoIdType`.  Types with a `table` property will hereafter be referred to as "queryable."

**projectSetupA.js**
```javascript
import { dataTypes } from "mongo-graphql-starter";
const {
  MongoIdType,
  StringType,
  StringArrayType,
  IntType,
  IntArrayType,
  FloatType,
  FloatArrayType,
  DateType,
  arrayOf,
  objectOf,
  formattedDate,
  typeLiteral
} = dataTypes;

const Author = {
  fields: {
    name: StringType,
    birthday: DateType
  }
};

const Book = {
  table: "books",
  fields: {
    _id: MongoIdType,
    title: StringType,
    pages: IntType,
    weight: FloatType,
    keywords: StringArrayType,
    editions: IntArrayType,
    prices: FloatArrayType,
    authors: arrayOf(Author),
    primaryAuthor: objectOf(Author),
    strArrs: typeLiteral("[[String]]"),
    createdOn: DateType,
    createdOnYearOnly: formattedDate({ format: "%Y" })
  }
};

const Subject = {
  table: "subjects",
  fields: {
    _id: MongoIdType,
    name: StringType
  }
};

export default {
  Book,
  Subject,
  Author
};
```

Now tell mongo-graphql-starter to create your schema and resolvers, like this

```javascript
import { createGraphqlSchema } from "mongo-graphql-starter";
import projectSetup from "./projectSetupA";

import path from "path";

createGraphqlSchema(projectSetup, path.resolve("./test/testProject1"));
```

There should now be a graphQL folder containing schema, resolver, and type metadata files for your types, as well as a master resolver and schema file, which are aggregates over all the types.

![Image of basic scaffolding](docs-img/initialCreated.png)

Now tell Express about it—and don't forget to add a root object with a `db` property that resolves to a connection to your database.  

Here's what a minimal, complete example might look like.

```javascript
import { MongoClient } from "mongodb";
import expressGraphql from "express-graphql";
import resolvers from "./graphQL/resolver";
import schema from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";
import express from "express";

const app = express(),
  dbPromise = MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter"),
  root = {
    db: dbPromise
  },
  executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers });

app.use(
  "/graphql",
  expressGraphql({
    schema: executableSchema,
    graphiql: true,
    rootValue: root
  })
);
app.listen(3000);
```

Now `http://localhost:3000/graphql` should, assuming the database above exists, and has data, allow you to run queries.

![Image of graphiQL](docs-img/graphiQL-running.png)

## Valid types for your fields

Here are the valid types you can import from `mongo-graphql-starter`

```javascript
import { dataTypes } from "mongo-graphql-starter";
const {
  MongoIdType,
  StringType,
  StringArrayType,
  IntType,
  IntArrayType,
  FloatType,
  FloatArrayType,
  DateType,
  arrayOf,
  objectOf,
  formattedDate,
  typeLiteral
} = dataTypes;
```

Type|Description
----|-----------
`MongoId`|Will create your field as a string, and will return whatever Mongo uid that was created.  Any filters using this id will wrap the string in Mongo's `ObjectId` function.
`String`|Self explanatory
`StringArrayType`|An array of strings
`Int`|Self explanatory
`IntArrayType`|An array of integers
`Float`|Self explanatory
`FloatArrayType`|An array of floating point numbers
`Date`|Will create your field as a string, but any filters against this field will convert the string arguments you send into a proper date object, before passing to Mongo.  Moreoever, querying this date will by default format it as `MM/DD/YYYY`.  To override this, use `formattedDate`. 
`formattedDate`|Function: Pass it an object with a format property to create a date field with that (Mongo) format.  For example, `createdOnYearOnly: formattedDate({ format: "%Y" })`
`objectOf`|Function: Pass it a type you've created to specify a single object of that type
`arrayOf`|Function: Pass it a type you've created to specify an array of that type
`typeLiteral`|Function: pass it an arbitrary string to specify a field of that GraphQL type.  The field will be available in queries, but no filters will be created, though of course you can add your own to the generated code.

## Circular dependencies are fine

Feel free to have your types reference each other - it should work fine.  For example

```javascript
import { dataTypes } from "mongo-graphql-starter";
const {
  MongoIdType, 
  StringType, 
  IntType, 
  FloatType, 
  DateType, 
  arrayOf, 
  objectOf, 
  formattedDate, 
  typeLiteral 
} = dataTypes;

const Tag = {
  table: "tags",
  fields: {
    _id: MongoIdType,
    tagName: StringType
  }
};

const Author = {
  table: "authors",
  fields: {
    name: StringType,
    tags: arrayOf(Tag)
  }
};

Tag.fields.authors = arrayOf(Author);

export default {
  Author,
  Tag
};
```

generates a graphQL schema where this code runs fine

```javascript
test("Circular dependencies work", async () => {
  let tag = await runMutation({ 
    schema, 
    db, 
    mutation: `createTag(Tag: {tagName: "JavaScript"}){Tag{_id}}`, 
    result: "createTag" 
  });
  let author = await runMutation({
    mutation: `createAuthor(Author: { name: "Adam", tags: [{_id: "${tag._id}", tagName: "${tag.tagName}"}]}){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateTag(_id: "${tag._id}", Tag: { authors: [{_id: "${author._id}", name: "${author.name}"}]}){Tag{_id}}`,
    result: "updateTag"
  });

  await queryAndMatchArray({
    query: `{getTag(_id: "${tag._id}"){Tag{tagName, authors{ _id, name }}}}`,
    coll: "getTag",
    results: { tagName: "JavaScript", authors: [{ _id: author._id, name: "Adam" }] }
  });
});
```

## Queries created

For each queryable type, there will be a `get<Type>` query which receives an `_id` argument, and returns the single, matching object keyed under `<Type>`. 

For example

```javascript
{getBook(_id: "59e3dbdf94dc6983d41deece"){Book{createdOn}}}
```

will retrieve that book, bringing back only the `createdOn` field.

---

There will also be an `all<Type>s` query created, which receives filters for each field, described below. This query returns an array of matching results under the `<Type>s` key, as well as a Meta object which has a count property, and if specified, will return the record count for the entire query, beyond just the current page.

For example

```javascript
{allBooks(SORT: {title: 1}, PAGE: 1, PAGE_SIZE: 5){Books{title}, Meta{count}}}
```

Will retrieve the first page of books' titles, as well as the `count` of all books matching whatever filters were specified in the query (in this case there were none).

Note, if you don't query `Meta.count` from the results, then the total query will not be execute.  Similarly, if you don't query anything from the main result set, then that query will not execute.

The generated resolvers will analyze the AST and only query what you ask for.

## All filters available

This section describes the filters available in the `all<Type>s` query for each queryable type.

`string`, `stringArray`, `int`, `intArray`, `float`, `MongoId` and `date` fields will all have the following filters created

Exact match

`field: <value>` - will match results with exactly that value

`in` match

`field_in: [<value1>, <value2>]` - will match results which match any of those exact values.  

Note, for Date fields, the strings you send over will be converted to Date objects before being passed to Mongo.  Similarly, for MongoIds, the Mongo `ObjectId` method will be applied, before running the filter.  For string, int and float arrays, the value will be an entire array, which will be matched by Mongo item by item.

### String filters

If your field is named `title` then the following filters will be available

Filter|Description
------|-----------
String contains|`title_contains: "My"` - will match results with the string `My` anywhere inside, case insensitively. 
String starts with|`title_startsWith: "My"` - will match results that start with the string `My`, case insensitively. 
String ends with|`title_endsWith: "title"` - will match results that end with the string `title`, case insensitively. 

### String array filters

If your field is named `keywords` then the following filters will be available

Filter|Description
------|-----------
String array contains|`keywords_contains: "JavaScript"` - will match results with an array containing the string `JavaScript`. 

### Int filters

If your field is named `pages` then the following filters will be available

Filter|Description
------|-----------
Less than|`pages_lt: 200` - will match results where `pages` is less than 200 
Less than or equal|`pages_lte: 200` - will match results where `pages` is less than or equal to 200 
Greater than|`pages_gt: 200` - will match results where `pages` is greater than 200 
Greater than or equal|`pages_gte: 200` - will match results where `pages` is greater than or equal to 200 

### Int array filters

If your field is named `editions` then the following filters will be available

Filter|Description
------|-----------
Int array contains|`editions_contains: 2` - will match results with an array containing the value `2`. 

### Float filters

If your field is named `weight` then the following filters will be available 

Filter|Description
------|-----------
Less than|`weight_lt: 200` - will match results where `weight` is less than 200 
Less than or equal|`weight_lte: 200` - will match results where `weight` is less than or equal to 200 
Greater than|`weight_gt: 200` - will match results where `weight` is greater than 200 
Greater than or equal|`weight_gte: 200` - will match results where `weight` is greater than or equal to 200 

### Float array filters

If your field is named `prices` then the following filters will be available

Filter|Description
------|-----------
Float array contains|`prices_contains: 19.99` - will match results with an array containing the value `19.99`. 

### Date filters

If your field is named `createdOn` then the following filters will be available 

Filter|Description
------|-----------
Less than|`createdOn_lt: "2004-06-02T03:00:10"` - will match results where `createdOn` is less than that date 
Less than or equal|`createdOn_lte: "2004-06-02T03:00:10"` - will match results where `createdOn` is less than or equal to that date
Greater than|`createdOn_gt: "2004-06-02T03:00:10"` - will match results where `createdOn` is greater than that date
Greater than or equal|`createdOn_gte: "2004-06-02T03:00:10"` - will match results where `createdOn` is greater than or equal to that date

### Formatting dates

Each date field will also have a dateField_format argument created for queries, allowing you to customize the date formatting for that field; the format passed in should correspond to a valid Mongo date format.  For example, if your date is called `createdOn`, then you can do

```
{allBooks(pages: 100, createdOn_format: "%m"){createdOn}}
```

which will query books with a `pages` value of `100`, and return only the `createdOn` field, formatted as just the month.

### OR Queries

Combining filters with Mongo's `$or` is easy.  Just use the same API, but with `OR` instead of `$or` (`$` doesn't seem to be a valid character for GraphQL identifiers).  For example

```javascript
{
  allBooks(
    pages_gt: 50, 
    OR: [
      {title: "Book 1", pages: 100}, 
      {title_contains: "ook", OR: [{weight_gt: 2}, {pages_lt: 0}]}
    ]
  ) { 
    Book {
      _id
      title
      pages
      weight
    }
  }
}
```

will match all results where 

```
pages is greater than 50 
  AND (
    (title is "Book 1" AND pages is 100) 
    OR 
    (title contains "ook" 
      AND 
        (weight is greater than 2 OR pages is less than 0) 
    )
  )
```

### Nested object and array filters

For nested arrays or objects, you can pass a filter with the name of the field, that's of the same form as the corresponding type's normal filters.  For arrays, whatever you pass in will be translated into [`$elemMatch`](https://docs.mongodb.com/manual/reference/operator/query/elemMatch/), which means the record will have to have at least one array member which matches all of your criteria for it to be returned.  Similarly, for nested objects the record will have to have an object value which matches all criteria to be returned.

For example

```javascript
{allBlogs(
  comments: {
    upVotes: 4, 
    author: { 
      OR: [
        { name: "CA 3" }, 
        { favoriteTag: {name: "T1"} }
      ]
    } 
  }, 
  SORT: {title: 1}
){ Blogs{ title }}}
```

Will query blogs that have at least one comment which has 4 upvotes, and also has an author with either a name of "CA 3", or a favoriteTag with a name of "T1"

Or you could do

```javascript
{allBlogs(
  comments: {
    upVotes: 4, 
    OR: [
      {author: { name: "CA 3" } }, 
      {author: { favoriteTag: {name: "T1"}}}
    ]
  }, 
  SORT: {title: 1}
){ Blogs{ title }}}
```

which is identical.

### Sorting

To sort, use the `SORT` argument, and pass it an object literal with the field by which you'd like to sort, with the Mongo value of 1 for ascending, or -1 for descending.  For example

```
allBooks(SORT: {title: 1}){title, pages}
```

To sort by multiple fields, use `SORTS`, and send an array of those same object literals.  For example

```
allBooks(SORTS: [{pages: 1}, {title: -1}]){title, pages}
```

which will sort by pages ascending, and then by title descending. 

### Paging

Page your data in one of two ways.

Pass `LIMIT` and `SKIP` to your query, which will map directly to the `$limit` and `$skip` Mongo aggregation arguments.

Or send over `PAGE` and `PAGE_SIZE` arguments, which calculate `$limit` and `$skip` for you, and add to the Mongo query.

## Projecting results from queries

Use standard GraphQL syntax to select only the fields you want from your query.  The incoming ast will be parsed, and the generated query will only pull what was requested.  This applies to nested fields as well.  For example, given [this GraphQL setup](test/projectSetupB.js), [this unit test](test/testProject2/richQuerying.test.js#L234), and the others in the suite demonstrate the degree to which you can select nested field values.

## Mutations

Each queryable type will also generate a `create<Type>`, `update<Type>` and `delete<Type>` mutation.  

`create<Type>` will create a new object.  Pass a single `<Type>` argument with properties for each field on the type, and it will return back the new, created object under the `<Type>` key, or at least the pieces thereof which you specify in your mutation.

For example

```javascript
createBook(Book: {title: "Book 1", pages: 100}){Book{title, pages}}
```

---

`update<Type>` requires an `_id` argument, as well as an update argument, named for your `<Type>`. This argument can receive fields corresponding to each field in your type. Any value you pass will replace the corresponding value in Mongo.

For example

```javascript
updateBlog(_id: "${obj._id}", Blog: {words: 100}){Blog{title, words}}
```

In addition, the following arguments are supported

Argument|For types|Description
------|-------|------
`<fieldName>_INC`|Numeric|Increments the current value by the amount specified.  For example `Blog: {words_INC: 1}` will increment the current `words` value by 1.  
`<fieldName>_DEC`|Numeric|Decrements the current value by the amount specified.  For example `Blog: {words_DEC: 2}` will decrement the current `words` value by 2.
`<fieldName>_PUSH`|Arrays|Pushes the specified value onto the array.  For example `comments_PUSH: {text: "C2"}` will push that new comment onto the array.  Also works for String, Int, and Float arrays - just pass the string, integer, or floating point number, and it'll get added.
`<fieldName>_CONCAT`|Arrays|Pushes the specified values onto the array.  For example `comments_CONCAT: [{text: "C2"}, {text: "C3"}]` will push those new comments onto the array. Also works for String, Int, and Float arrays - just pass the strings, integers, or floating point numbers, as an array, and they'll get added.
`<fieldName>_UPDATE`|Arrays|**For arrays of other types, defined with `arrayOf`**<br/><br/>Takes an `index` and an update object, named for the array type.  Updates the object at `index` with the changes specified.  Note, this update object is of the same form specified here. If that object has numeric or array fields, you can specify `field_INC`, `field_PUSH`, etc. For example `comments_UPDATE: {index: 0, Comment: { upVotes_INC: 1 } }` will increment the `upVotes` value in the first comment in the array, by 1.<br /><br />**For IntArrays, FloatArrays, or StringArrays**<br/><br/>Takes an `index` and a `value`, which will be an `Int`, `Float` or `String` depending on the array type.  Updates the object at `index` with the `value` specified.<br/><br/>`updateBook(_id: "5", Book: { editions_UPDATE: {index: 1, value: 11} }) {Book{title, editions}}`
`<fieldName>_UPDATES`|Arrays|Same as UPDATE, but takes an array of these same inputs.  For example `tagsSubscribed_UPDATES: [{index: 0, Tag: {name: "t1-update"} }, {index: 1, Tag: {name: "t2-update"} }]` will make those renames to the name fields on the first, and second tags in the array.<br/><br/>Or for Int, String, Float arrays, `updateBook(_id: "${obj._id}", Book: {editions_UPDATES: [{index: 0, value: 7}, {index: 1, value: 11}] }) {Book{title, editions}}` which of course will modify those editions.
`<fieldName>_UPDATE`|Objects|Implements the specified changes on the nested object.  The provided update object is of the same form specified here.  For example `favoriteTag_UPDATE: {timesUsed_INC: 2}` will increment `timesUsed` on the `favoriteTag` object by 2

Full examples are below.

---

`delete<Type>` takes a single `_id` argument, and deletes it.

---

### Mutation examples

[Example of create and delete, together](test/testProject1/deletion.test.js#L14)

[Example of a basic update](test/testProject1/mutations.test.js#L144)

[Full example of nested updates](test/testProject2/richUpdating.test.js#L439)

[Another example of nested updates, with array CONCAT](test/testProject2/richUpdating.test.js#L466)

## Middleware

Middleware allows you to add cross cutting concerns to your resolvers. After your query is processed, and all of the Mongo filters, projections, paging, etc are computed, these values are passed through each registered middleware, allowing them to modify these values as needed.  For example

```javascript
import { middleware } from "mongo-graphql-starter";

middleware.use((deconstructedQuery, root, args, context, ast) => {
  deconstructedQuery.$match.title = "Book 1";
});
```

will, uselessly, force every query run on every type to add a title match of "Book 1".

A more useful example, coming soon, would be middleware that takes the `userId` value from the Express request object, representing the logged-on user, and adds it to all queries so they only return results belonging to the current user.

---

From the middleware shown above, `deconstructedQuery` is the entire packet of Mongo query items that were calculated from the args passed to your resolver.  This object contains:

Property|Description
--------|-----------
`$match`|The Mongo filters
`$project`|The Mongo projection object
`$sort`|The Mongo sort object
`$limit`|The limit value
`$skip`|The skip value

This is your opportunity to mutate any of these values.  The remaining arguments passed to your middleware are the same ones passed to all resolvers:

Argument|Description
--------|-----------
`root`|The root object. This will have your db object, and anything else you chose to add to it
`args`|The graphQL arguments object
`context`|By default your Express request object 
`ast`|The entire graphQL query AST with complete info about your query: query name, fields requested, etc

If you need to do asynchronous work, just have the method return a Promise.  The generated graphQL resolver will `await` each middleware you register, then continue on and run the Mongo query with whatever values you leave in `deconstructedQuery`.

### Preprocessor

Similar to middleware, preprocessors run before any work is done in the resolvers, and are passed the `root`, `args`, `context` and `ast` objects to be mutated as needed.  Use this as an opportunity to amend or validate what the user sends over.  For example, 

```javascript
import { preprocessor } from "mongo-graphql-starter";

preprocessor.use((root, args, context, ast) => {
  args.PAGE = 2;
  args.PAGE_SIZE = 3;
});
```

will force every query to have a page size of 3, and request page number 2.  A more useful example might enforce a maximum `PAGE_SIZE` value, so users don't request too much data in one request. 

## A closer look at what's generated

All code generated is modern JavaScript, meaning ES6, plus `async` / `await` and object spread, along with ES6 modules (`import` / `export`).  If you're running Node 8.5 or better, and you're using John Dalton's [outstanding ESM loader](https://github.com/standard-things/esm) (and I'd urge you to do so) then this code should just work.  If any of those conditions are false, you'll need to pipe the results through Babel using your favorite build tool.

## What does the generated code look like?

The book project referenced at the beginning of these docs generates [this code](exampleGeneratedCode/bookProject)

### All code is extensible.  

All of these schema and resolver files are only generated the first time; if you run the utility again, they will not be over-written (though an option to override that may be added later).  The idea is that generated schema and resolver files are a useful starting point that will usually need one-off tweaks and specialized use cases added later.

Each type has its own folder, and always generates a type metadata file, and a graphQL schema file.  If the type is not contained in a Mongo collection, then it will just generate a basic type, as well as an input type used by any object which contains references to it (the sort input type isn't yet used for these types). If the type is backed by a Mongo collection, then the schema file will also contain queries, mutations, and filters; and a resolver file will also be created defining the queries and mutations.

## What's next

- Allow filtering through nested objects and arrays
- Add more data types, and filters
- Allow queryable types to define relationships between one another, so related data can be queries intelligently, without the SELECT N+1 problem