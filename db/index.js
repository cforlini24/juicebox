const {Client} = require("pg");
require('dotenv').config();

const client = new Client(process.env.DATABASE_URL);
client.password = "SdlZmJeNn942gacLf4qA7ocJgcqr7V97";

async function getAllUsers(){
    try {
        const {rows} = await client.query(`
        SELECT id, username FROM users;        
        `);
        return rows;
    } catch (error) {
        console.log(error)
    }
}

async function createUser({username, password, location, name}) {
    try {
        const {rows} = await client.query(`
        INSERT INTO users(username, password, name, location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password, name, location]);
        return rows;
    } catch (error) {
        console.log(error);
    }
}

async function updateUser(id, {location, name}){
    try {
        console.log("Starting update of user....")
        const {rows} = await client.query(`
        UPDATE users
        SET "name" = $1, "location" = $2
        WHERE id = $3
        RETURNING *;
        `, [name, location, id]);
        return rows;
    } catch (error) {
        console.log(error);
    }
}

async function createPost({authorId, title, content, tags = []}){
    try {
        const {rows: [post]} = await client.query(`
        INSERT INTO posts("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,[authorId, title, content])
        
        const tagList = await createTags(tags);

        await addTagsToPost(post.id, tagList)

        return getPostById(post.id)
    } catch (error) {
        console.log(error);
    }
}

async function updatePost(postId, fields = {}) {
    try {
        console.log("Starting update of post...")
        const {tags} = fields;
        delete fields.tags;

        const setString = Object.keys(fields).map(
            (key, index) => `"${ key }"=$${ index + 1 }`
          ).join(', ');

        if (setString.length > 0){
            await client.query(`
                UPDATE posts
                SET ${setString}
                WHERE id = ${postId}
                RETURNING *;
                `,Object.values(fields));
        }

        if( tags === undefined) {
            return await getPostById(postId);
        }

        const tagList = await createTags(tags);
        const tagListIdString = tagList.map((tag) => {
            return `${tag.id}`
        }).join(", ");

        await client.query(`
        DELETE FROM post_tags
        WHERE "tagId"
        NOT IN (${tagListIdString})
        AND "postId" = $1;        
        `,[postId])

        await addTagsToPost(postId, tagList);

        return await getPostById(postId);
    } catch (error) {
        console.log(error);
    }
}

async function getAllPosts() {
    try {
        const { rows: postIds } = await client.query(`
            SELECT id
            FROM posts;
        `);

        const posts = await Promise.all(postIds.map(
        post => getPostById( post.id )
        ));

        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function getPostsByUser(userId) {
    try {
        const { rows: postIds } = await client.query(`
            SELECT id 
            FROM posts 
            WHERE "authorId"=${ userId };
        `);
  
        const posts = await Promise.all(postIds.map(
            post => getPostById( post.id )
        ));
  
        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function getUserById(userId) {
    try {
        const {rows: [user]} = await client.query(`
        SELECT id, username, name, location, active FROM users
        WHERE id = ${userId};
        `)
        if(!user) return null;

        const posts = await getPostsByUser(userId);
        user.posts = posts
        return user;
    } catch (error) {
        console.log(error);
    }
}

async function createTags(tagList) {
    if (!tagList.length) return;

    const insertValues = tagList.map(
        (_, index) => `$${index + 1}`).join('), (');

    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');

    try {
        await client.query(`
        INSERT INTO tags(name)
        VALUES (${insertValues})   
        ON CONFLICT (name) DO NOTHING;     
        `,Object.values(tagList))

        const {rows} = await client.query(`
        SELECT * FROM tags 
        WHERE name
        IN (${selectValues});
        `,Object.values(tagList))
        return rows;
    } catch (error) {
        console.group(error);
    }
}

async function createPostTag(postId, tagId){
    try {
        await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
        `, [postId, tagId])
    } catch (error) {
        console.log(error);
    }
}

async function getPostById(postId) {
    try {
      const { rows: [post] } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postId]);
      

      if (!post) {
        throw {
          name: "PostNotFoundError",
          message: "Could not find a post with that postId"
        };
      }
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
      `, [postId])
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authorId])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorId;
  
      return post;
    } catch (error) {
      throw error;
    }
  }

async function addTagsToPost(postId, tagList) {
    try {
        const createPostTagPromise = tagList.map((tag) => {
            return createPostTag(postId, tag.id)
        });

        await Promise.all(createPostTagPromise);

        return await getPostById(postId);
    } catch (error) {
        console.log(error);
    }
}

async function getPostsByTagName(tagName) {
    try {
        const {rows: postIds} = await client.query(`
        SELECT posts.id FROM posts
        JOIN post_tags ON posts.id = post_tags."postId"
        JOIN tags ON tags.id = post_tags."tagId"
        WHERE tags.name = $1;
        `, [tagName]);

        return await Promise.all(postIds.map((post) => {
            return getPostById(post.id)
        }))
    } catch (error) {
        console.log(error);
    }
}

async function getAllTags() {
    try {
        const {rows} = await client.query(`
        SELECT * FROM tags;
        `)
        return rows;
    } catch (error) {
        console.log(error)
    }
}

async function getUserByUsername(username){
    try {
        const {rows: [user]} = await client.query(`
        SELECT * FROM users
        WHERE username = $1;
        `,[username])
        return user;
    } catch (error) {
        console.log(error)
    }
}

module.exports ={client, getAllUsers, createUser, updateUser, createPost,updatePost, getAllPosts,getUserById, getPostsByUser, addTagsToPost, createTags, getPostsByTagName, getAllTags, getUserByUsername, getPostById};