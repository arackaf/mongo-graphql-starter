import { query as BookQuery, mutation as BookMutation, type as BookType } from './Book/schema';
import { query as SubjectQuery, mutation as SubjectMutation, type as SubjectType } from './Subject/schema';
import { type as AuthorType } from './Author/schema';
    
export default `
  ${BookType}

  ${SubjectType}

  ${AuthorType}

  type Query {
    ${BookQuery}

    ${SubjectQuery}
  }

  type Mutation {
    ${BookMutation}

    ${SubjectMutation}
  }

`