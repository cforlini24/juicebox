const {client, getAllUsers, createUser, updateUser, createPost, getAllPosts, updatePost, getPostsByUser, getUserById} = require("./index");

async function testDb(){
    try {
        client.connect();
        const users = await getAllUsers();
        console.log(users);
        client.end();
    } catch (error) {
        console.log(error)
    }
}

async function dropTables(){
    try {
        console.log("Starting to drop tables...");
        await client.query(`
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `)
        console.log("Tables dropped.");
    } catch (error) {
        console.log(error);
    }
}

async function createTables() {
    try {
        console.log("Starting to create tables...");
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `);
        await client.query(`
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        )
        `)
        console.log("Tables created.")
    } catch (error) {
        console.log(error);
    }
}

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");
        await createUser({username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney, Australia'});
        await createUser({username:'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't tellin'"});
        await createUser({username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side'});
        console.log("Users created.");
    } catch (error) {
        console.log(error);
    }
}

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();
        console.log("Creating initial posts....")
        await createPost({
            authorId: albert.id,
            title: "First post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them."
        })
        await createPost({
            authorId: sandra.id,
            title: "Sandra's post",
            content: "Hello world!"
        })
        await createPost({
            authorId: glamgal.id,
            title: "IDK",
            content: "You tell me."
        })
    } catch (error) {
        console.log(error);
    }
}

async function buildDb() {
    try {
        client.connect()
        await dropTables();
        await createTables();
        await createInitialUsers();
        const users = await getAllUsers();
        console.log(users)
        await createInitialPosts();
        const posts = await getAllPosts();
        console.log(posts);
        const updatedUser = await updateUser(users[0].id, {name: 'Newname Sogood', location: "Lesterville, KY"})
        console.log(updatedUser)
        client.end();
    } catch (error) {
        console.log(error);
    }
}

buildDb();
