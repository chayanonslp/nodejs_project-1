var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "notify_repair"
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected! To port: http://localhost:3000/");
});

module.exports = db;