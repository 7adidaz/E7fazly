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
 