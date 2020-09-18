import mongoose, { Schema } from "mongoose";

export const AuthorSchema = new Schema(
  {
    name: String,
    birthday: Date,
    strings: [String]
  },
  { _id: false }
);

export const BookSchema = new Schema({
  title: {
    type: String
  },
  pages: Number,
  weight: Number,
  keywords: [String],
  editions: [Number],
  prices: [Number],
  isRead: Boolean,
  mongoId: Schema.Types.ObjectId,
  mongoIds: [Schema.Types.ObjectId],
  authors: [AuthorSchema],
  primaryAuthor: AuthorSchema,
  // strArrs: typeLiteral("[[String]]"),
  createdOn: Date,
  // createdOnYearOnly: formattedDate({ format: "%Y" }),
  jsonContent: Schema.Types.Mixed
});
export const BookModel = mongoose.model("Book", BookSchema);

/*  */

/*  */
// export const SubjectSchema = new Schema({
//   name: String
// });
// export const SubjectModel = mongoose.model("Subject", SubjectSchema);

// export const TagSchema = new Schema({
//   name: String,
//   count: Number
// });
// export const TagModel = mongoose.model("Tag", TagSchema);

// export const ReadOnlyTagSchema = new Schema({
//   name: String
// });
// export const ReadOnlyTagModel = mongoose.model("ReadOnlyTag", SubjectSchema);
