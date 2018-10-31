

var sql = require('sql.js');
var db;


exports.createDb = function () {
	console.log("createDb");
//	filebuffer = fs.readFileSync('raul.sqlite');
	db =  new sql.Database(); //filebuffer);
	createTables();
}


function createTables() {
    console.log("createTable patients");
    db.run(`CREATE TABLE IF NOT EXISTS patients
    (ID integer PRIMARY KEY AUTOINCREMENT,
     LastName TEXT NOT NULL,
     FirstName TEXT,
     Age integer
)`);
    console.log("createTable medications");
    db.run(`CREATE TABLE IF NOT EXISTS medications
    (ID integer PRIMARY KEY AUTOINCREMENT,
     label TEXT NOT NULL
)`);
    console.log("createTable prescriptions");
    db.run(`CREATE TABLE IF NOT EXISTS prescriptions
    (ID integer PRIMARY KEY AUTOINCREMENT,
     patient_id integer,
     medication_id integer,
     start_date DATETIME,
     duration integer,
     parent integer,
     FOREIGN KEY (patient_id) REFERENCES patients(ID),
     FOREIGN KEY (medication_id) REFERENCES medications(ID)
    )`);
    var path = require('path');
    var data = db.export();
    var buffer = new Buffer(data);
    var fs = require('fs');
    console.log("DB written at: " + path.join(__dirname, "raul.sqlite"))
    fs.writeFileSync(path.join(__dirname, "raul.sqlite"), buffer);
}

// function insertRows() {
//     console.log("insertRows");

// }

// function readAllRows() {
//     console.log("readAllRows lorem");
// }

// function closeDb() {
//     console.log("closeDb");
//     db.close();
// }

