const {Client} = require("pg");

const client = new Client('postgres://localhost:5432/juicebox-dev');
client.password = "1025464";

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
        console.log(rows);
    } catch (error) {
        console.log(error);
    }
}

async function updateUser(id, {location, name}){
    try {
        console.log("Starting update....")
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

async function createPost({authorId, title, content}){
    try {
        const {rows} = await client.query(`
        INSERT INTO posts("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,[authorId, title, content])
        return rows;
    } catch (error) {
        console.log(error);
    }
}

async function updatePost(id, {title, content}) {
    try {
        const {rows} = await client.query(`
        UPDATE posts
        SET title = $1, content = $2
        WHERE id = $3
        RETURNING *;
        `,[title, content, id]);
        return rows;
    } catch (error) {
        console.log(error);
    }
}

async function getAllPosts() {
    try {
        const {rows} = await client.query(`
        SELECT title,content FROM posts;
        `)
        return rows;
    } catch (error) {
        console.log(error);
    }
}

async function getPostsByUser(userId) {
    try {
        const {rows} = await client.query(`
        SELECT * FROM posts
        WHERE "authorId" = ${userId};
        `)
        return rows;
    } catch (error) {
        console.log(error);
    }
}

async function getUserById(userId) {
    try {
        const {rows} = await client.query(`
        SELECT * FROM users
        WHERE id = ${userId};
        `)
        if(!rows.length) return null;
        delete rows.password;
        const posts = getPostsByUser(userId);
        rows.posts = posts
        return rows;
    } catch (error) {
        console.log(error);
    }
}

module.exports ={client, getAllUsers, createUser, updateUser, createPost,updatePost, getAllPosts,getUserById, getPostsByUser};