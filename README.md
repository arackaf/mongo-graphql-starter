# mongo-graphql-starter

This utility will scaffold GraphQL schema and resolvers, with queries, filters and mutations working out of the box, based on metadata you enter about
your Mongo db.

The idea is to auto-generate the mundane, repetative boilerplate needed for a graphQL endpoint, then get out of your way, leaving you to code your odd
or advanced edge cases as needed.

## Prior art

This project is heavily inspired by [Graph.Cool](https://www.graph.cool/). It's an amazing graphQL-as-a-service that got me hooked immediately on the
idea of auto-generating graphQL queries, filters, etc on your data store. The only thing I disliked about it was that you lose control of your data.
You lack the ability to connect directly to your database and index tune, bulk insert data, bulk update data, etc. This project aims to provide the
best of both worlds: your graphQL endpoint—including queries and mutations—are auto generated, but on top of the database you provide, and by
extension retain control of. Moreover, the graphQL schema and resolvers are generated in such a way that adding your own one-off edge cases is easy,
and encouraged.

This project is otherwise unrelated to Graph.Cool. It is not in any way intended to be—and never will be—a full clone, and any similarities to the
APIs generated are incidental.

## How do you use it?

Let's work through a simple example.

First, create your db metadata like this. Each mongo collection you'd like added to your GraphQL endpoint needs to contain the table name, and all of
the fields, keyed off of the data types provided. If you're creating a type which will only exist inside another type's Mongo fields, then you can
omit the table property.

For any type which is contained in a Mongo collection—ie has a `table` property—if you leave off the `_id` field, one will be added for you, of type
`MongoIdType`. Types with a `table` property will hereafter be referred to as "queryable."

**projectSetupA.js**

```javascript
import { dataTypes } from "mongo-graphql-starter";
const {
  MongoIdType,
  MongoIdArrayType,
  StringType,
  StringArrayType,
  BoolType,
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
    isRead: BoolType,
    mongoIds: MongoIdArrayType,
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

There should now be a graphQL folder containing schema, resolver, and type metadata files for your types, as well as a master resolver and schema
file, which are aggregates over all the types.

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

const app = express();
const dbPromise = MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
const root = {
  db: dbPromise
};
const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers });

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
  MongoIdArrayType,
  StringType,
  StringArrayType,
  BoolType,
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

| Type               | Description                                                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MongoIdType`      | Will create your field as a string, and will return whatever Mongo uid that was created. Any filters using this id will wrap the string in Mongo's `ObjectId` function.                                                                                                               |
| `MongoIdArrayType` | An array of mongo ids                                                                                                                                                                                                                                                                 |
| `BoolType`         | Self explanatory                                                                                                                                                                                                                                                                      |
| `StringType`       | Self explanatory                                                                                                                                                                                                                                                                      |
| `StringArrayType`  | An array of strings                                                                                                                                                                                                                                                                   |
| `IntType`          | Self explanatory                                                                                                                                                                                                                                                                      |
| `IntArrayType`     | An array of integers                                                                                                                                                                                                                                                                  |
| `FloatType`        | Self explanatory                                                                                                                                                                                                                                                                      |
| `FloatArrayType`   | An array of floating point numbers                                                                                                                                                                                                                                                    |
| `DateType`         | Will create your field as a string, but any filters against this field will convert the string arguments you send into a proper date object, before passing to Mongo. Moreoever, querying this date will by default format it as `MM/DD/YYYY`. To override this, use `formattedDate`. |
| `formattedDate`    | Function: Pass it an object with a format property to create a date field with that (Mongo) format. For example, `createdOnYearOnly: formattedDate({ format: "%Y" })`                                                                                                                 |
| `objectOf`         | Function: Pass it a type you've created to specify a single object of that type                                                                                                                                                                                                       |
| `arrayOf`          | Function: Pass it a type you've created to specify an array of that type                                                                                                                                                                                                              |
| `typeLiteral`      | Function: pass it an arbitrary string to specify a field of that GraphQL type. The field will be available in queries, but no filters will be created, though of course you can add your own to the generated code.                                                                   |

## Circular dependencies are fine

Feel free to have your types reference each other. For example, the following will generate a perfectly valid schema. 

```javascript
import { dataTypes } from "mongo-graphql-starter";
const { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf, objectOf, formattedDate, typeLiteral } = dataTypes;

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

## Queries created

For each queryable type, there will be a `get<Type>` query which receives an `_id` argument, and returns the single, matching object keyed under
`<Type>`.

For example

```javascript
{getBook(_id: "59e3dbdf94dc6983d41deece"){Book{createdOn}}}
```

will retrieve that book, bringing back only the `createdOn` field.

---

There will also be an `all<Type>s` query created, which receives filters for each field, described below. This query returns an array of matching
results under the `<Type>s` key, as well as a Meta object which has a count property, and if specified, will return the record count for the entire
query, beyond just the current page.

For example

```javascript
{allBooks(SORT: {title: 1}, PAGE: 1, PAGE_SIZE: 5){Books{title}, Meta{count}}}
```

Will retrieve the first page of books' titles, as well as the `count` of all books matching whatever filters were specified in the query (in this case there were none).

Note, if you don't query `Meta.count` from the results, then the total query will not be execute. Similarly, if you don't query anything from the main result set, then that query will not execute.

The generated resolvers will analyze the AST and only query what you ask for.

## All filters available

All scalar fields, and scalar array fields (`StringArray`, `IntArray`, etc) will have the following filters created

Exact match

`field: <value>` - will match results with exactly that value

Not equal

`field_ne: <value>` - will match results that do not have this value. For array types, pass in a whole array of values, and Mongo will do an element
by element comparison.

`in` match

`field_in: [<value1>, <value2>]` - will match results which match any of those exact values.

For Date fields, the strings you send over will be converted to Date objects before being passed to Mongo. Similarly, for MongoIds, the Mongo
`ObjectId` method will be applied before running the filter. For the array types, the value will be an entire array, which will be matched by Mongo
item by item.

### String filters

If your field is named `title` then the following filters will be available

| Filter             | Description                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| String contains    | `title_contains: "My"` - will match results with the string `My` anywhere inside, case insensitively. |
| String starts with | `title_startsWith: "My"` - will match results that start with the string `My`, case insensitively.    |
| String ends with   | `title_endsWith: "title"` - will match results that end with the string `title`, case insensitively.  |

### String array filters

If your field is named `keywords` then the following filters will be available

| Filter                | Description                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| String array contains | `keywords_contains: "JavaScript"` - will match results with an array containing the string `JavaScript`. |

### Int filters

If your field is named `pages` then the following filters will be available

| Filter                | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| Less than             | `pages_lt: 200` - will match results where `pages` is less than 200                 |
| Less than or equal    | `pages_lte: 200` - will match results where `pages` is less than or equal to 200    |
| Greater than          | `pages_gt: 200` - will match results where `pages` is greater than 200              |
| Greater than or equal | `pages_gte: 200` - will match results where `pages` is greater than or equal to 200 |

### Int array filters

If your field is named `editions` then the following filters will be available

| Filter             | Description                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| Int array contains | `editions_contains: 2` - will match results with an array containing the value `2`. |

### Float filters

If your field is named `weight` then the following filters will be available

| Filter                | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| Less than             | `weight_lt: 200` - will match results where `weight` is less than 200                 |
| Less than or equal    | `weight_lte: 200` - will match results where `weight` is less than or equal to 200    |
| Greater than          | `weight_gt: 200` - will match results where `weight` is greater than 200              |
| Greater than or equal | `weight_gte: 200` - will match results where `weight` is greater than or equal to 200 |

### Float array filters

If your field is named `prices` then the following filters will be available

| Filter               | Description                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Float array contains | `prices_contains: 19.99` - will match results with an array containing the value `19.99`. |

### Date filters

If your field is named `createdOn` then the following filters will be available

| Filter                | Description                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Less than             | `createdOn_lt: "2004-06-02T03:00:10"` - will match results where `createdOn` is less than that date                 |
| Less than or equal    | `createdOn_lte: "2004-06-02T03:00:10"` - will match results where `createdOn` is less than or equal to that date    |
| Greater than          | `createdOn_gt: "2004-06-02T03:00:10"` - will match results where `createdOn` is greater than that date              |
| Greater than or equal | `createdOn_gte: "2004-06-02T03:00:10"` - will match results where `createdOn` is greater than or equal to that date |

### Formatting dates

Each date field will also have a `dateField_format` argument created for queries, allowing you to customize the date formatting for that field; the
format passed in should correspond to a valid Mongo date format. For example, if your date is called `createdOn`, then you can do

```
{allBooks(pages: 100, createdOn_format: "%m"){createdOn}}
```

which will query books with a `pages` value of `100`, and return only the `createdOn` field, formatted as just the month.

### OR Queries

Combining filters with Mongo's `$or` is easy. Just use the same API, but with `OR` instead of `$or` (`$` doesn't seem to be a valid character for
GraphQL identifiers). For example

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

For nested arrays or objects, you can pass a filter with the name of the field, that's of the same form as the corresponding type's normal filters.
For arrays, whatever you pass in will be translated into [`$elemMatch`](https://docs.mongodb.com/manual/reference/operator/query/elemMatch/), which
means the record will have to have at least one array member which matches all of your criteria for it to be returned. Similarly, for nested objects
the record will have to have an object value which matches all criteria to be returned.

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

To sort, use the `SORT` argument, and pass it an object literal with the field by which you'd like to sort, with the Mongo value of 1 for ascending,
or -1 for descending. For example

```
allBooks(SORT: {title: 1}){title, pages}
```

To sort by multiple fields, use `SORTS`, and send an array of those same object literals. For example

```
allBooks(SORTS: [{pages: 1}, {title: -1}]){title, pages}
```

which will sort by pages ascending, and then by title descending.

### Paging

Page your data in one of two ways.

Pass `LIMIT` and `SKIP` to your query, which will map directly to the `$limit` and `$skip` Mongo aggregation arguments.

Or send over `PAGE` and `PAGE_SIZE` arguments, which calculate `$limit` and `$skip` for you, and add to the Mongo query.

## Projecting results from queries

Use standard GraphQL syntax to select only the fields you want from your query. The incoming ast will be parsed, and the generated query will only
pull what was requested. This applies to nested fields as well. For example, given [this GraphQL setup](test/projectSetupB.js),
[this unit test](test/testProject2/richQuerying.test.js#L234), and the others in the suite demonstrate the degree to which you can select nested field
values.

## Mutations

Each queryable type will also generate a `create<Type>`, `update<Type>` and `delete<Type>` mutation.

`create<Type>` will create a new object. Pass a single `<Type>` argument with properties for each field on the type, and it will return back the new,
created object under the `<Type>` key, or at least the pieces thereof which you specify in your mutation.

For example

```javascript
createBook(Book: {title: "Book 1", pages: 100}){Book{title, pages}}
```

---

`update<Type>` requires an `_id` argument, as well as an update argument, named for your `<Type>`. This argument can receive fields corresponding to
each field in your type. Any value you pass will replace the corresponding value in Mongo.

For example

```javascript
updateBlog(_id: "${obj._id}", Blog: {words: 100}){Blog{title, words}}
```

In addition, the following arguments are supported

| Argument              | For types | Description|
| --------------------- | --------- | --------------------------------------- |
| `<fieldName>_INC`     | Numeric   | Increments the current value by the amount specified. For example `Blog: {words_INC: 1}` will increment the current `words` value by 1.                                                                                      |
| `<fieldName>_DEC`     | Numeric   | Decrements the current value by the amount specified. For example `Blog: {words_DEC: 2}` will decrement the current `words` value by 2.                                                                                                                     |
| `<fieldName>_PUSH`    | Arrays    | Pushes the specified value onto the array. For example `comments_PUSH: {text: "C2"}` will push that new comment onto the array. Also works for String, Int, and Float arrays - just pass the string, integer, or floating point number, and it'll get added.                                                                                                                               |
| `<fieldName>_CONCAT`  | Arrays    | Pushes the specified values onto the array. For example `comments_CONCAT: [{text: "C2"}, {text: "C3"}]` will push those new comments onto the array. Also works for String, Int, and Float arrays - just pass the strings, integers, or floating point numbers, as an array, and they'll get added. |
| `<fieldName>_UPDATE`  | Arrays    | **For arrays of other types, defined with `arrayOf`**<br/><br/>Takes an `index` and an update object, named for the array type. Updates the object at `index` with the changes specified. Note, this update object is of the same form specified here. If that object has numeric or array fields, you can specify `field_INC`, `field_PUSH`, etc. For example `comments_UPDATE: {index: 0, Comment: { upVotes_INC: 1 } }` will increment the `upVotes` value in the first comment in the array, by 1.<br /><br />**For `StringArray`, `IntArray`, `FloatArray`, and `MongoIdArray`**<br/><br/>Takes an `index` and a `value`, which will be an `Int`, `Float` or `String` depending on the array type. Updates the object at `index` with the `value` specified.<br/><br/>`updateBook(_id: "5", Book: { editions_UPDATE: {index: 1, value: 11} }) {Book{title, editions}}` |
| `<fieldName>_UPDATES` | Arrays    | Same as UPDATE, but takes an array of these same inputs. For example `tagsSubscribed_UPDATES: [{index: 0, Tag: {name: "t1-update"} }, {index: 1, Tag: {name: "t2-update"} }]` will make those renames to the name fields on the first, and second tags in the array.<br/><br/>Or for Int, String, Float arrays, `updateBook(_id: "${obj._id}", Book: {editions_UPDATES: [{index: 0, value: 7}, {index: 1, value: 11}] }) {Book{title, editions}}` which of course will modify those editions.  |
| `<fieldName>_UPDATE`  | Objects   | Implements the specified changes on the nested object. The provided update object is of the same form specified here. For example `favoriteTag_UPDATE: {timesUsed_INC: 2}` will increment `timesUsed` on the `favoriteTag` object by 2 |
| `<fieldName>_PULL`    | Arrays    | Removes the indicated items from the array.<br /><br />**For `StringArray`, `IntArray`, `FloatArray`, and `MongoIdArray`**<br /><br />Takes an array of items to remove. For example, `updateBook(_id: "${obj._id}", Book: { editions_PULL: [4, 6] }) {Book{title, editions}}` will remove editions 4 and 6 from the array.<br /><br />**For arrays of other types**<br /><br />Pass in a normal filter object to remove all items which match. For example, `updateBook(_id: "${obj._id}", Book: { authors_PULL: {name_startsWith: "A"}}){Book{ title }}` will remove all authors with a name starting with "A"  |

Full examples are below.

---

`delete<Type>` takes a single `_id` argument, and deletes it.

---

### Mutation examples

[Example of create and delete, together](test/testProject1/deletion.test.js#L14)

[Example of a basic update](test/testProject1/mutations.test.js#L144)

[Full example of nested updates](test/testProject2/richUpdating.test.js#L439)

[Another example of nested updates, with array CONCAT](test/testProject2/richUpdating.test.js#L466)

## Defining relationships between types (wip)

Relationships can be defined between queryable types. This allows you to normalize your data into separate Mongo collections, related by foreign keys.

This feature is still a work in progress, so expect some things to be missing or incomplete, and of course the API may change.

For the following examples, consider this setup

```javascript
import { dataTypes } from "mongo-graphql-starter";
const { MongoIdType, MongoIdArrayType, StringType, IntType, FloatType, DateType, relationshipHelpers } = dataTypes;

const Author = {
  table: "authors",
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
    mainAuthorId: MongoIdType,
    authorIds: MongoIdArrayType
  }
};
```

### Defining an array of foreign keys

To declare that the Book type's `authorIds` field represents an array of foreign keys to the authors collection, you'd use the
`relationshipHelpers.projectIds` method, like so

```javascript
relationshipHelpers.projectIds(Book, "authors", {
  type: Author,
  fkField: "authorIds"
});
```

This adds a new `authors` array to the Book type, which are read from the authors collection, by `_id`, based on the values in a book's `authorIds`
array. Note that `authorIds` must either be a `StringArrayType`, or `MongoIdArrayType`.

### Defining a single foreign key

To declare that the Book type's `mainAuthorId` represents a foreign key to the authors collection, you'd use the `relationshipHelpers.projectId`
method, like so

```javascript
relationshipHelpers.projectId(Book, "mainAuthor", {
  type: Author,
  fkField: "mainAuthorId"
});
```

This adds a new `mainAuthor` object to the Book type, which is read from the authors collection, by `_id`, based on the value in the book's
`mainAuthorId` field. Note that `mainAuthorId` must either be a `StringType` or `MongoIdType`.

### Using relationships

In either case above, the `mainAuthor` object, or `authors` array is of the normal `Author` type, and is requested normally in your GraphQL queries.

If you do not request anything, then nothing will be fetched from Mongo, as usual. If you do request them, then the ast will be parsed, and only the queried author fields will fetched, and returned.

Note that for any `Book` query, the books from the current query are read from Mongo first. Then, if `authors` or `mainAuthor` is requested, then a
single query is issued for each, to get the related authors for those books which were just read, which are then matched up appropriately. In other
words, the generated code does not suffer from the Select N + 1 problem.

## Lifecycle hooks

Most applications will have some cross-cutting concerns, like authentication. The queries and mutations generated have various hooks that you can tap into, to add custom behavior.

Most of the hooks receive these arguments (and possibly others) which are defined here, once.

| Argument  | Description                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------- |
| `root`    | The root object. This will have your db object, and anything else you chose to add to it            |
| `args`    | The graphQL arguments object                                                                        |
| `context` | By default your Express request object                                                              |
| `ast`     | The entire graphQL query AST with complete info about your query: query name, fields requested, etc |

### All available hooks

| Hook                                                     | Description   |
| -------------------------------------------------------- | --------------|
| `queryPreprocess(root, args, context, ast)`              | Run in `all<Type>s` and `get<Type>` queries before any processing is done. This is a good place to manually adjust arguments the user has sent over; for example, you might manually set or limit the value of `args.PAGE_SIZE` to prevent excessive data from being requested. |
| `queryMiddleware(queryPacket, root, args, context, ast)` | Called after the args and ast are parsed, and turned into a Mongo query, but before the query is actually run. See below for a full listing of what `queryPacket` contains. This is your chance to adjust the query that's about to be run, possibly to add filters to ensure the user doesn't access data she's not entitled to. |
| `beforeInsert(obj, root, args, context, ast)`            | Called before a new object is inserted. `obj` is the object to be inserted. Return `false` to cancel the insertion |
| `afterInsert(obj, root, args, context, ast)`            | Called after a new object is inserted. `obj` is the newly inserted object. This could be an opportunity to do any logging on the just-completed insertion.  |
| `beforeUpdate(match, updates, root, args, context, ast)` | Called before an object is updated. `match` is the filter object that'll be passed directly to Mongo to find the right object. `updates` is the update object that'll be passed to Mongo to make the requested changes. Return `false` to cancel the update.  |
| `afterUpdate(match, updates, root, args, context, ast)`  | Called after an object is updated. `match` and `updates` are the same as in `beforeUpdate`.  This could be an opportunity to do any logging on the just-completed update.  |
| `beforeDelete(match, root, args, context, ast)`          | Called before an object is deleted. `match` is the object passed to Mongo to find the right object. Return `false` to cancel the deletion.  |
| `afterDelete(match, root, args, context, ast)`           | Called after an object is deleted. `match` is the same as in `beforeDelete`  |
| `adjustResults(results)`                                 | Called immediately before objects are returned, either from queries, insertions or mutations—basically any generated operation which returns `Type` or `[Type]`—results will always be an array. The actual objects queried from Mongo are passed into this hook. Use this as an opportunity to manually adjust data as needed, ie you can format dates, etc.  |

#### The `queryPacket` argument to the queryMiddleware hook

The `queryPacket` passed to the queryMiddleware hook will have all of the properties which are passed directly to Mongo. Mutate them as needed, for example to make sure that the current user is only querying data that belongs to her.

| Property   | Description                                                                           |
| ---------  | ------------------------------------------------------------------------------------- |
| `$match`   | The filters for the query                                                             |
| `$project` | The query's projections                                                               |
| `$sort`    | The sorting object                                                                    |
| `$skip`    | Self explanatory. This is calculated based on the paging parameters sent over, if any |
| `$limit`   | Self explanatory. This is calculated based on the paging parameters sent over, if any |

### How to use processing hooks

There should be a hooks.js file generated at the root of your graphQL folder, right next to the root resolver and schema, which should look like this

```javascript
export default {
  Root: {
    queryPreprocess(root, args, context, ast) {
      //Called before query filters are processed
    },
    queryMiddleware(queryPacket, root, args, context, ast) {
      //Called after query filters are processed, which are passed in queryPacket
    },
    beforeInsert(objToBeInserted, root, args, context, ast) {
      //Called before an insertion occurs. Return false to cancel it
    },
    afterInsert(newObj, root, args, context, ast) {
      //Called after an object is inserted
    },
    beforeUpdate(match, updates, root, args, context, ast) {
      //Called before an update occurs. Return false to cancel it
    },
    afterUpdate(match, updates, root, args, context, ast) {
      //Called after an update occurs. The filter match, and updates objects will be
      //passed into the first two parameters, respectively
    },
    beforeDelete(match, root, args, context, ast) {
      //Called before a deletion. Return false to cancel it.
    },
    afterDelete(match, root, args, context, ast) {
      //Called after a deltion. The filter match will be passed into the first parameter.
    },
    adjustResults(results) {
      //Called anytime objects are returned from a graphQL endpoint. Use this hook to make adjustments to them.
    }
  }
};
```

Add implementations to whichever methods you need.  These hooks under Root will be called every time, always. To create hooks that only apply to certain types, just add a key next to root, with the name of the type, with the same methods; you don't have to add all available methods, of course—just add the methods you need.  For example

```javascript
export default {
  Root: {
    queryPreprocess(root, args, context, ast) {
      args.PAGE_SIZE = 50;
    }
  },
  Book: {
    queryPreprocess(root, args, context, ast) {
      args.PAGE_SIZE = 100;
    }
  }
};
```

will cause every query to have a PAGE_SIZE set to 50, always—except for `Book` queries, which wich will have it set to 100.

If a hook is defined both in Root, and for a type, then for operations on that type, the root hook will be called first, followed by the one for the type. So above, PAGE_SIZE will first be set to 50, and then to 100.

#### Doing asynchronous processing in hooks.

The code which calls these hook methods will do so with `await`.  That means if you need to do asynchronous work in any of these methods, you can just make the hook itself an async method, and `await` any async operation you need.  Or of course you could also return a Promise, which is essentially the same thing.

#### Reusing code across types' hooks

Many of these preprocessing hooks will be of a similar format, and so the risk of tedious duplication is high.  To help avoid this you can, if you want, just provide a class for either Root, or any Type. If you do, then the class will be instantiated, and the same hook methods will be looked for on the newly-created instance.  For example

```javascript
export default {
  Root: HooksRoot,
  Type2: Type2Hooks
};
```

will work fine, assuming `HooksRoot` and `Type2Hooks` are JavaScript classes.


## A closer look at what's generated

All code generated is modern JavaScript, meaning ES6, plus `async` / `await` and object spread, along with ES6 modules (`import` / `export`). If
you're running Node 8.5 or better, and you're using John Dalton's [outstanding ESM loader](https://github.com/standard-things/esm) (and I'd urge you
to do so) then this code should just work. If any of those conditions are false, you'll need to pipe the results through Babel using your favorite
build tool.

## What does the generated code look like?

The book project referenced at the beginning of these docs generates [this code](exampleGeneratedCode/bookProject)

### All code is extensible.

All of these schema and resolver files are only generated the first time; if you run the utility again, they will not be over-written (though an
option to override that may be added later). The idea is that generated schema and resolver files are a useful starting point that will usually need
one-off tweaks and specialized use cases added later.

Each type has its own folder, and always generates a type metadata file, and a graphQL schema file. If the type is not contained in a Mongo
collection, then it will just generate a basic type, as well as an input type used by any object which contains references to it (the sort input type
isn't yet used for these types). If the type is backed by a Mongo collection, then the schema file will also contain queries, mutations, and filters;
and a resolver file will also be created defining the queries and mutations.

## What's next

* Expand existing relationships to allow more options and relationship types
