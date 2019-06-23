import { BookSingleQueryResult, BookQueryResults, Author } from "./graphql-types";

let singleResult: BookSingleQueryResult = null as any;
let title: string = singleResult.Book.title;

let results: BookQueryResults = null as any;

let firstBook = results.Books[0];
let _id: string = firstBook._id;
let pages: number = firstBook.pages;

let authors = firstBook.authors;
let firstAuthor = authors[0];
let firstName: string = firstAuthor.name;

let cachedAuthors = firstBook.cachedAuthors;
let firstCachedAuthor: Author = cachedAuthors[0];
let name: string = firstCachedAuthor.name;
