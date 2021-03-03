const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const db_name = path.join(__dirname, "data", "data2.db");

//connect to database
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    console.error(err.message);
    res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
  }
  console.log("Successful connection to the database database");
});

const sql_create = `CREATE TABLE IF NOT EXISTS USERS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  caption TEXT NOT NULL
);`;

//create table if not exists
db.run(sql_create, err => {
  if (err) {
    console.error(err.message);
    res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
  }
  console.log("Successful creation of the 'Users' table");
});

module.exports = db;