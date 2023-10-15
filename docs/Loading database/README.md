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
  "parent_id" INT,
  "name" VARCHAR(255),
  "icon" TEXT, 
  "owner_id" INT,
  FOREIGN KEY ("owner_id") REFERENCES "user"("id"),
  FOREIGN KEY ("directory_parent_id") REFERENCES "directory"("id")
);

CREATE TABLE "bookmark" (
  "id" SERIAL PRIMARY KEY,
  "link" TEXT,
  "owner_id" INT,
  "directory_id" INT,
  "type" bookmark_type,
  "favorite" boolean,
  FOREIGN KEY ("owner_id") REFERENCES "user"("id"),
  FOREIGN KEY ("directory_id") REFERENCES "directory"("id")
);

CREATE TABLE "user_directory_access" (
	"directory_id" INT,
	"user_id" INT,
	"user_rights" access_rights, 
	PRIMARY KEY ("user_id", "directory_id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id"),
	FOREIGN KEY ("directory_id") REFERENCES "directory"("id")
);
CREATE TABLE "tag" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(255),
    "owner_id" INT,
  FOREIGN KEY ("owner_id") REFERENCES "user"("id"),
);

CREATE TABLE "bookmark_tag" (
    "bookmark_id" INT NOT NULL,
    "tag_id" INT NOT NULL,
    PRIMARY KEY ("bookmark_id", "tag_id"),
    FOREIGN KEY ("bookmark_id") REFERENCES "bookmark" ("id"),
    FOREIGN KEY ("tag_id") REFERENCES "tag" ("id")
);

```