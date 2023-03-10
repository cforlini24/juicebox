const {client, getAllUsers, createUser} = require("./index");

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
            password varchar(255) NOT NULL
        );
        `);
        console.log("Tables created.")
    } catch (error) {
        console.log(error);
    }
}

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");
        await createUser({username: 'albert', password: 'bertie99'});
        await createUser({username:'sandra', password: '2sandy4me'});
        await createUser({username: 'glamgal', password: 'soglam'});
        console.log("Users created.");
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
        client.end();
    } catch (error) {
        console.log(error);
    }
}

buildDb();
