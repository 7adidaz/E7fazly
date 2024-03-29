### What is the idea of the project?
- Allow users to store different types of bookmarks, where they can organize these bookmarks into folders/directories. A bookmark can only belong to one directory.
- Every bookmark can be tagged with multiple tags. 
- A user can share a folder/directory with another user, who can either view or edit the content of this folder. 

### Basic tables:
- user 
- bookmark 
- directory

### Relations: 
- A **User** can have multiple **Bookmark**s.  1 → M
- A **User** can have access to multiple **Directories**. N → M
- A **User** can own to multiple **Directories**. 1 → M
- A **Directory** can have multiple **Bookmark**s. 1 → M 
- A **Directory** can have multiple **Directories**. 1 → M

A new table was introduced to host the Relation between **User** and the access rights to other folders. 

#### Design decision: 
- having an access_id as PK and reference the userId and the directory as FK.
- having userId and directoryId as compound keys. Which is better? 

Since the access rights for a use to a certain table are unique, having the compound key is better because, it will simplify the data retrieval, where joins are not necessary, which is also applicable for the bookmark_tags table. 

![E7fazly Project (4)](https://github.com/7adidaz/E7fazly/assets/86894852/2231a855-a33b-4702-abf8-960d3c776e87)


**Suggested**: 
- A new entity to save the highlights from a bookmark. 

--- 
Number of dumb data inserted using the program in 'loading database': 

10000 user, 
20000 directories, 
22982 bookmarks, 
6000 tag for 3156 user,
2854 user access rights
