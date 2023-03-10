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

async function createUser({username, password}) {
    try {
        const {rows} = await client.query(`
        INSERT INTO users(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password]);
        console.log(rows);
    } catch (error) {
        console.log(error);
    }
}

module.exports ={client, getAllUsers, createUser};