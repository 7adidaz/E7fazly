### What is the idea of the project?
- Allow users to store different types of bookmarks, where he can organize these bookmarks into folders/directories. A bookmark can only belogin to one directory.
- Every bookmark can be tagged with multiple tags. 
- A user can share a folder/directory to another user, who can either view or edit the content of this folder. 

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

A new table introduced to host the Relation between **User** and the access rights to other folders. 

#### Design decision: 
- having an access_id as PK and reference the user_id and the directory_id as FK.
- having user_id and directory_id as compound key. Which is better? 

Since the access rights to for a use to a certain table is unique, having the compound key is better because, it will simplify the data retrieval, where join are not necessary, which is also applicable for the bookmark_tags table. 

![schema](./Pictures/E7fazly%20Project.png) 


**Suggested**: 
- A new entity to save the highlights from a bookmark. 

--- 
Number of dumb data inserted using the program in 'loading database': 

10000 user, 
20000 directories, 
22982 bookmarks, 
6000 tag for 3156 user,
2854 user access rights
