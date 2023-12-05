# E7fazly - أحفظلي 

E7fazly is an Arabic word that means "save it for me", which this backend does! E7fazly is a backend that helps users save their bookmarks into folders, which can be nested inside other folders, which itself can be saved inside folders -the sky is the limit, jk. it's the storage:)- 

### Workflow

- When a user creates an account an implicit folder (base_directory) is created as its base directory; no other users are allowed to be granted access to this folder, this folder also works for "unlabeled" bookmarks. 
- A user can create as many folders as he can, nested or flat. 
- The user can also add as many bookmarks as he wants to his folders. 
- These bookmarks can be photos or links, which can be tagged with tags (duh). 
- A user can have a list of the tags used to tag the bookmark and also can get bookmarks that are tagged with a specific tag. 
- The user can grant access (to view or to edit) to a folder, the granted access user can view all bookmarks under the folder as well as all the nested folders and their content. 



## What the backend supports
- Authentication using JWT 
- Authorization 
- Validation using JOI 
- Caching using Redis 
- [Database](./server/docs/Database.md) using Prisma + Postgresql. 
- A TON of testing using JEST
- Serving images on the fly -stateless-

---
Frontend Pages by [Hazem](github.com/Hazemmahdyx): 
![image](https://github.com/7adidaz/E7fazly/assets/86894852/41b42c71-60e4-43e8-95da-0f54309b203d)

![image](https://github.com/7adidaz/E7fazly/assets/86894852/ece5b2f3-c822-42e2-a75e-b6e3a3f252e6)

![image](https://github.com/7adidaz/E7fazly/assets/86894852/08541d07-51e5-42c0-9558-0b798620e3e9)
