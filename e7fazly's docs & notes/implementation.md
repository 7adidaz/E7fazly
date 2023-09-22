
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
    - [ ] if a user has edit access rights, should he be able to add others to view/ edit? //TODO 
    - [ ] if a user has added/edited dir/bkmrks/tags to other's dir, when he deletes his account, should it be removed?. 
    - [ ] make sure users cannot grant access to other's base_dir, nor edit it.


----
Questions: 

    - [ ] should the tag be normalized? aka CS = cs = Cs = cS
    - [ ] should i implement an option that when revoking access for a user, one can revoke access to all of its nested directories, maybe through an extra entry in the request?? 
    - [ ] what should be the behavior when revoking access from a dir, with some user's added stuff??
