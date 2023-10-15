E7fazly - أحفظلي 

E7fazly is an Arabic word that means "save it for me", which this backend does! E7fazly is a backend that helps users save their bookmarks into folders, which can be nested inside other folders, which itself can be saved inside folders -the sky is the limit, jk. it's actually the storage:)- 

typical workflow if you are a frontend and wanna work on this project: 

- when a user creates an account an implicit folder (base_directory) is created as its base directory; no other users are allowed to be granted access to this folder, this folder also works for "unlabeled" bookmarks. 
- a user can create as many folders as he can, nested or flat. 
- the user can also add as many bookmarks as he wants to his folders. 
- these bookmarks can be photos or links, which can be tagged with tags (duh). 
- a user can have a list of the tags used to tag the bookmark and also can get bookmarks that are tagged with a specific tag. 

- user can grant access (to view or to edit) to a folder, the granted access user can view all bookmarks under the folder as well as all the nested folders and their content. 



The backend does: 
- Authentication using JWT 
- Authorization 
- Validation using JOI 
- Caching using Redis 
- Databases using Prisma + Postgresql (look at [here](./docs/Database.md))
- A TON of testing using JEST 

---
Project TODOs: 

- [ ] add support for image upload ( no s3:( )
- [ ] email verification routes (links through emails not codes or both)
- [ ] add notes for bookmarks, and support text search in them 
