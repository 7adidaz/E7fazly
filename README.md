# E7fazly - أحفظلي 

E7fazly is the Arabic word for “save for me”. It is a RESTful API that enables users to save and sort their bookmarks into folders, share these folders with others, and add tags to the bookmarks. E7fazly can handle any kind of bookmark, be it a photo or a link. The only limitation is storage space. :)

Demo: 

https://github.com/7adidaz/E7fazly/assets/86894852/6e8d94eb-9d38-4211-9463-f4d74fc955b3


## What does the backend support?
- Authentication using JWT.
- Authorization.
- Centralized error Handling.
- Caching using [Redis](https://redis.io/).
- Input data validation using [JOI](https://joi.dev/).
- Email verification using [Resend](https://resend.com).
- A ton of end-to-end and unit testing using [JEST](https://jestjs.io/).
- Stateless image handling and serving using [Puppeteer](https://pptr.dev/).
- Postgresql with Prisma ORM. Check out the [database scheme](./server/docs/Database.md).

## Workflow
- A user’s account comes with a default folder called base_directory, which serves as the root folder for all their bookmarks.
- The base_directory folder is private and cannot be shared with other users. It also contains any unlabeled bookmarks that the user has not assigned to any folder.
- A user can create and nest folders as they wish, without any limit on the number or depth of folders.
- A user can store any number of bookmarks in their folders. These bookmarks can be either photos or links.
- A user can organize their bookmarks by tagging them with relevant keywords. A user can also view all the bookmarks that have a certain tag.
- A user can share a folder with another user, giving them either view or edit access. The shared folder includes all the bookmarks and subfolders inside it.

## Project TODOS: 
- [ ] Refactor Testing and Make use of [Factory Classes](https://refactoring.guru/design-patterns/factory-method)
- [ ] Set up a CI pipeline using GitHub Actions.
- [ ] Dockerizing the server for easy collaboration. 
- [ ] Improve Caching strategy.
- [ ] Checkout Frontend [TODOS](https://github.com/Hazemmahdyx/Bookly?tab=readme-ov-file#tasks-todo). 

---

This app is a collaborative project with [Hazem](https://github.com/Hazemmahdyx), check out his frontend source [code](https://github.com/Hazemmahdyx/Bookly). 
