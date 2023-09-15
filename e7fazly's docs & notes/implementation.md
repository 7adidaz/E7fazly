
### notes to remember when implementing handlers.
- user 
    - when a user is created, a "unorderd" folder should be initated as the default folder for bookmarks without a folder. 
    - when a user is deleted, delete all bookmarks, directories, tags, access rights related to this user.


- directory 
    - when a dir is deleted, delete all nested directories, bookmarks and tags and any access rights to this dir. 
    - when a directory is created it should inherate the parent directories access rights. 

- bookmark
    - when bookmark is deleted delete all it's entries on bookmark_tag and access rights to it.

- tag 
    - when a tag is inserted, if it's already exists for this user, then just use put entries in bookmark_tag.
    - when a tag is deleted, delete all of it's entites on bookmark_tag and if's the last entires of this tag, delete the tag from tag table.


--- 
- for user, 
    -  i think we need to enable search by email. -> probably not a good idea
    - if a user trying to get his account and is not verifed now, should be redirected to /verify or smth. 

--- 
- email verification
    - when user sign up, there is a code to be send to verify the email. 
    - either with a column in the table's user. 
    - or using a database table. 

---
- directories 
    - should /dir/all get the directories at level 0 ??? 
    - if a user tried to update his base_directory, it should fail //TODO