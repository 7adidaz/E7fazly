### notes to remember when implementing handlers.
- user 
    - [ ] email verification model
    - [ ] if a user trying to get his account and is not verifed now, should be redirected to /verify or smth. 


- directory 
    - [ ] when a directory is created it should inherate the parent directories access rights. 

- tag 
    - [ ] when a tag is inserted, if it's already exists -same name- for this user, then just use put entries in bookmark_tag.
    - [ ] when a tag is removed from a bkmrk, delete the entry from the bookmark_tag folder.. if it's the last entry of the tag, delete the tag from the tag table.

- access 
    - [ ] if a user has added/edited dir/bkmrks/tags to other's dir, when he deletes his account, should it be removed? NO. 
    - [ ] make sure users cannot grant access to other's base_dir, nor edit it.


----
Questions: 

