This is the document for the unit testing for controllers 

#### USER 
- createUser (create.test.js)
    - [x] create a user with a unique email

- getByEmail (get.test.js)
    - [x] get a user by email 
- getUser 
    - [x] get user by ID 

- updateUser (update.test.js)
    - [x] update user basic information

- deleteUser (delete.test.js)
    - [x] delete a user by id

#### Directory
- createDirectory (create.test.js)
    - [x] create one directory
    - [x] create nested directories 
    - [x] create 50 directories

- contentbyParent  (get.test.js)
    - [x] get the content of a directory with bkmrks and nested dir.
- getAllDirectories 
    - [x] get all directories for a user

- updateDirectoriesByIds (update.test.js)
    - [x] update a set of flat directories by nesting them. 

- deleteDirectoriesByIds (delete.test.js)
    - [x] delete a list of directories 

#### Bookmark 
- createBookmark 
    - [x] create a simple bookmark
    - [x] create multiple bookmarks 

- getBookmarkById 
    - [x] get a bookmark by id 
- getAllBookmarks 
    - [x] get all bookmarks 
- getBookmarksByTag
    - [x] get bookmarks under some tag

- updateBookmarks 
    - [x] update a single bookmark
    - [x] update multiple bookmarks

- deleteBookmarks
    - [x] delete multiple bookmarks 

#### Tag
- addTagForBookmark
    - [x] add a unique tag to a bookmark
    - [x] add a tag with already exists name to a bookmark

- updateTagName 
    - [x] update a tag name 

- removeTagFrom
    - [x] remove a tag that is already exists for other bookmarks
    - [x] remove a tag from its last bookmark owner

#### ACCESS 

- grantAccess 
    - [ ] add access right to a user

- revokeAccess
    - [ ] remove access right form a user

- updateAccess
    - [ ] update the access right for a user

#### Cross units testing 
NOTE: **should the handling of this be in authorization middleware??**

test env: 
- 2 users i will call them: Privliged and Normal
- 2 directories for each
- 2 bookmarks for each
- 4 tags for each 
- one user have access to
    - 1 dir with view rights
    - 1 dir with edit rights

tests: 

- user Privliged [create inside, update, delete] a directory that he has access to. 
- user Privliged [create, update, delete] a bookmark  that he has access to it's parent dir.
- user Privliged [add, remove] tags from a bookmark that he has access to it's parent dir.
 