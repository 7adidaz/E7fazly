
### notes to remember when implementing handlers.
- user 
    - when a user is created, a "unorderd" folder should be initated as the default folder for bookmarks without a folder. -DONE through the base_dir- //TODO: tests
    - when a user is deleted, delete all bookmarks, directories, tags, access rights related to this user. -DONE through the CASCADE-



- directory 
    - when a dir is deleted, delete all nested directories, bookmarks and tags and any access rights to this dir.  -DONE through the CASCADE-
    - when a directory is created it should inherate the parent directories access rights. //TODO

- bookmark
    - when bookmark is deleted delete all it's entries on bookmark_tag and access rights to it. -DONE through the CASCADE- 

- tag 
    - when a tag is inserted, if it's already exists -same name- for this user, then just use put entries in bookmark_tag.
    - when a tag is removed from a bkmrk, delete the entry from the bookmark_tag folder.. if it's the last entry of the tag, delete the tag from the tag table.
    - should the tag be normalized? aka CS = cs = Cs = cS //TODO

- access 
    - if a user has edit access rights, should he be able to add others to view/ edit? //TODO 
    - if a user has added/edited dir/bkmrks/tags to other's dir, when he deletes his account, should it be removed?. 
    - make sure users cannot grant access to other's base_dir, nor edit it.
    - should implement an option that when revoking access for a user, one can revoke access to all of its nested directories, maybe through an extra entry in the request. 
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
    - should /dir/all get the directories at level 0  -in the base_dir-??? 
    - if a user tried to update his base_directory, it should fail //TODO
    - since dragable items are allowed, one should allow to the update of multiple 