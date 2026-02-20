postgres=# create database blog_db;
CREATE DATABASE

postgres=# \c blog_db
You are now connected to database "blog_db" as user "postgres".

blog_db=# CREATE TABLE blogs (
blog_db(# id SERIAL PRIMARY KEY,
blog_db(# author TEXT,
blog_db(# url TEXT NOT NULL,
blog_db(# title TEXT NOT NULL,
blog_db(# likes INTEGER DEFAULT 0);
CREATE TABLE

blog_db=# \d blogs
                            Table "public.blogs"
 Column |  Type   | Collation | Nullable |              Default
--------+---------+-----------+----------+-----------------------------------
 id     | integer |           | not null | nextval('blogs_id_seq'::regclass)
 author | text    |           |          |
 url    | text    |           | not null |
 title  | text    |           | not null |
 likes  | integer |           |          | 0
Indexes:
    "blogs_pkey" PRIMARY KEY, btree (id)

blog_db=# INSERT INTO blogs(author, url, title, likes) VALUES
blog_db-# ('Michael Chan', 'https://reactpatterns.com/', 'React patterns', 7),
blog_db-# ('Edsger W. Dijkstra', 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', 'Go To Statement Considered Harmful', 5)
blog_db-# RETURNING *;
