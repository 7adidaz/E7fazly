### This is just a small program that uses faker.js to load the database with dummy data and test it's resiliency!

to do this, you have to 
  - run the sql commands in your postgresql terminal 
  - put the connection link in the .env file 
  - run `npm run install` 
  - checkout the functions in `index.js`

```sql 
CREATE TYPE access_rights AS ENUM ('edit', 'view');
CREATE TYPE bookmark_type AS ENUM ('link', 'img', 'etc');

CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "email" VARCHAR(255),
  "password" VARCHAR(255)
);

CREATE TABLE "directory" (
  "id" SERIAL PRIMARY KEY ,
  "parentId" INT,
  "name" VARCHAR(255),
  "icon" TEXT, 
  "ownerId" INT,
  FOREIGN KEY ("ownerId") REFERENCES "user"("id"),
  FOREIGN KEY ("directory_parentId") REFERENCES "directory"("id")
);

CREATE TABLE "bookmark" (
  "id" SERIAL PRIMARY KEY,
  "link" TEXT,
  "ownerId" INT,
  "directoryId" INT,
  "type" bookmark_type,
  "favorite" boolean,
  FOREIGN KEY ("ownerId") REFERENCES "user"("id"),
  FOREIGN KEY ("directoryId") REFERENCES "directory"("id")
);

CREATE TABLE "user_directory_access" (
	"directoryId" INT,
	"userId" INT,
	"userRights" access_rights, 
	PRIMARY KEY ("userId", "directoryId"),
	FOREIGN KEY ("userId") REFERENCES "user"("id"),
	FOREIGN KEY ("directoryId") REFERENCES "directory"("id")
);
CREATE TABLE "tag" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(255),
    "ownerId" INT,
  FOREIGN KEY ("ownerId") REFERENCES "user"("id"),
);

CREATE TABLE "bookmark_tag" (
    "bookmarkId" INT NOT NULL,
    "tagId" INT NOT NULL,
    PRIMARY KEY ("bookmarkId", "tagId"),
    FOREIGN KEY ("bookmarkId") REFERENCES "bookmark" ("id"),
    FOREIGN KEY ("tagId") REFERENCES "tag" ("id")
);

```