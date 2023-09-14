## TODOs: 
- [ ] update the directory logic 
    1. if user have access to higher directory and want to access subdirectory, it should be allowed.. if a user want to get the users that have access to directory it should include all of user's that have access to the subdirectory's super directory.
    2. another approach: make when access is give it should cascade to all the subdirectory (prefered!). if so, search how to get over the circular dependency between the user and the directory.. or create another table for the base_directory. 


### what's done in: 
##### 13 sep
- [x] continue to refactor the error handling
- [x] export validators to middlewares. 

##### 14 sep
- [x] generete the new database schema from  & update the user's creation model 
- [x] make sure to transactionally create the user and it's base directory. 