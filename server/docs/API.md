#### CRUD operations needed and corresponded API. 

- User 
	- Create a user 
	- Read
		- 1 user.
	- Update 
		- 1 user
	- Delete 
		- 1 user

- POST user/create
- GET user:/id 
- PATCH user:/id
- DELETE user:/id (this should delete all user's bkmrk, dir and tags).

---- 
- Directory (per user)
	- Create a directory
	- Read 
		- 1 directory 
		- multiple directories (maybe nested in a file)
		- All directories
	- Update
		- 1 directory
	- Delete 
		- 1 directory (if it's a master it well propagated to all its entities)
		- multiple directories (duo to a selection or smth)
		- All directories (delete account or smth) → no need for API, because this can be done internally. 

- POST dir/create
- GET dir:/id 
- GET dir/content:/prntdir_id -> get parent dir' info and it's content. 
- GET dir/all 
- PATCH dir:/id -> changing icon, name. 
~~- DELETE dir:/id ~~ -- should propagate to its content (bkmrk & tags). (this should be compined with the below)
- DELETE dir:/ids -- same as above.

---
- Bookmark
	- Create a bookmark
	- Read
		- 1 bookmark
		- multiple bookmarks (nested in a file or smth)
		- All bookmarks
	- Update
		- 1 bookmark 
		- multiple bookmarks 
	- Delete 
		- 1 bookmark 
		- multiple bookmarks (nested in a file or smth)
		- All bookmarks (delete account or smth) → like dir, this is can be done internally.

- POST bkmrk/create
- GET bkmrk:/id
- GET bkmrk:/prntdir_id→ for bkmrks for the parent dir' id. 
- GET bkmrk/all 
- GET bkmrk_\tag:/tag_id → get bkmrks for a specific tag.
- PATCH bkmrk:/id → update to fav, update title, tags, etc. 
- ~~DELETE bkmrk:/id~~-- should propagate to its content (tags). lower is sufficient. 
- DELETE bkmrk:/ids -- same as above.

---
- Tag
	- Create a tag 
	- Read
		- multiple tags
		- all tags
	- Update
		- 1 tag
	- Delete 
		- 1 tag (need to propagated to bookmark_tag table)

- POST tag/create → it has to be linked to a bookmark. 
- GET \tag/bkmrk:/bkmrk_id → get tags for specific bookmark.
- GET \tag/all → this is typically for a specific user. 
- PATCH \tag:/id → enables renaming a tag through tags' menu.
- DELETE \tag:/id -> through tags' menu also. 
- DELETE \tag/:tag_id/:bkmrk_id -> delete a tag from a post edit or smth


--- 
- access rights 
- POST access/create // should send an array of users to add the access to!
- GET access/:id // propably not needed! 
- PATCH access/:id
- DELETE access/:id
