
### notes to remember when implementing handlers.
- user 
    - when a user is created, a "unorderd" folder should be initated as the default folder for bookmarks without a folder. 
    - when a user is deleted, delete all bookmarks, directories, tags, access rights related to this user.


- directory 
    - when a dir is deleted, delete all nested directories, bookmarks and tags and any access rights to this dir. 

- bookmark
    - when bookmark is deleted delete all it's entries on bookmark_tag and access rights to it.

- tag 
    - when a tag is inserted, if it's already exists for this user, then just use put entries in bookmark_tag.
    - when a tag is deleted, delete all of it's entites on bookmark_tag and if's the last entires of this tag, delete the tag from tag table.


--- 
 for user, 
    -  i think we need to enable search by email. -> probably not a good idea

--- 
- email verification
    - when user sign up, there is a code to be send to verify the email. 
    - a table needed to verify the email.

- for directories, directories that at level zero gonna have thier parent as "0" instead of null!. 

--- 
##### requests

NOtE for PATCH, the resource id should be in the params.

--- 
NOTE: some id's are equal to zero, which may not pass the `if (!id)`!  FIXED by isNumber Method