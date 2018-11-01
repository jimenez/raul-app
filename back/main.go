package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
)

// create tables in the database if they don't exist already
func createTables(db *sql.DB) error {
	logrus.Debug("createTable patients")
	statement, err := db.Prepare(`CREATE TABLE IF NOT EXISTS patients
    (ID integer PRIMARY KEY AUTOINCREMENT,
     LastName TEXT NOT NULL,
     FirstName TEXT
)`)
	if err != nil {
		return err
	}
	_, err = statement.Exec()
	if err != nil {
		return err
	}

	logrus.Debug("createTable medications")
	statement, err = db.Prepare(`CREATE TABLE IF NOT EXISTS medications
    (ID integer PRIMARY KEY AUTOINCREMENT,
     label TEXT NOT NULL
)`)
	if err != nil {
		return err
	}
	_, err = statement.Exec()
	if err != nil {
		return err
	}

	logrus.Debug("createTable prescriptions")
	statement, err = db.Prepare(`CREATE TABLE IF NOT EXISTS prescriptions
    (ID integer PRIMARY KEY AUTOINCREMENT,
     patient_id integer,
     medication_id integer,
     start_date TEXT,
     duration integer,
     parent integer,
     FOREIGN KEY (patient_id) REFERENCES patients(ID),
     FOREIGN KEY (medication_id) REFERENCES medications(ID)
    )`)
	if err != nil {
		return err
	}
	_, err = statement.Exec()
	if err != nil {
		return err
	}

	logrus.Debug("tables created")
	return nil
}

// create dummy data in the database if they don't exist already
func createDummyData(db *sql.DB) {
	/* errors are ignored here, this is a temporary function */
	logrus.Debug("createDummyData patients")
	statement, _ := db.Prepare("INSERT OR IGNORE INTO patients (ID, Firstname, Lastname) VALUES (?, ?, ?)")
	statement.Exec(1, "Joe", "Dalton")
	statement.Exec(2, "William", "Dalton")
	statement.Exec(3, "Jack", "Dalton")
	statement.Exec(4, "Averell", "Dalton")

	logrus.Debug("createDummyData medications")
	statement, _ = db.Prepare("INSERT OR IGNORE  INTO medications (ID, label) VALUES (?, ?)")
	statement.Exec(1, "Clopidogrel")
	statement.Exec(2, "ASA")
	statement.Exec(3, "Rivaroxaban")

	logrus.Debug("createDummyData prescriptions")
	statement, _ = db.Prepare("INSERT OR IGNORE INTO prescriptions (ID, patient_id, medication_id, start_date, duration, parent) VALUES (?, ?, ?, ?, ?, ?)")
	statement.Exec(1, 1, 1, "02-02-2018 00:00", 365, 0)
	statement.Exec(2, 1, 2, "02-02-2018 00:00", 0, 0)
	statement.Exec(3, 1, 2, "02-02-2018 00:00", 30, 2)
	statement.Exec(4, 1, 2, "02-04-2018 00:00", 10, 2)
	statement.Exec(5, 1, 2, "02-06-2018 00:00", 30, 2)
	statement.Exec(6, 1, 2, "02-08-2018 00:00", 10, 2)
	statement.Exec(7, 1, 3, "02-02-2018 00:00", 365, 0)
}

// JSON object representing one task
type task struct {
	ID        int    `json:"id,omitempty"`
	Text      string `json:"text,omitempty"`
	StartDate string `json:"start_date,omitempty"`
	Type      string `json:"type,omitempty"`
	Duration  int    `json:"duration,omitempty"`
	Parent    int    `json:"parent,omitempty"`
	Open      bool   `json:"open,omitempty"`
}

// JSON object representing all the tasks
type tasks struct {
	Data []task `json:"data"`
}

// /patient/{id} route
func GetPatient(w http.ResponseWriter, r *http.Request) {
	// get patent's id from url
	params := mux.Vars(r)
	id := params["id"]

	// select data from the database
	rows, err := db.Query("SELECT prescriptions.ID, start_date, duration, parent, label FROM prescriptions, medications WHERE medication_id = medications.id AND patient_id = " + id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// create tasks object
	ts := tasks{}

	// for each row, create a new json object
	for rows.Next() {

		// create task object
		t := task{}

		// fill task from database row
		err = rows.Scan(&t.ID, &t.StartDate, &t.Duration, &t.Parent, &t.Text)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// if there is no duration, it's a "project"
		if t.Duration == 0 {
			t.Type = "project"
			t.Open = false
		}

		// add task to the list of tasks
		ts.Data = append(ts.Data, t)
	}
	rows.Close()

	// header to allow the front to access this endpoint
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// return JSON from the API
	json.NewEncoder(w).Encode(ts)
}

// database object to be accessed by the routes
var db *sql.DB

func main() {
	// add -p flag to select port
	port := flag.Int("p", 7778, "port to listen on")
	flag.Parse()

	// set debug level for the logger
	logrus.SetLevel(logrus.DebugLevel)

	// open sqlite file from disk
	var err error
	db, err = sql.Open("sqlite3", "./raul.db")
	if err != nil {
		logrus.Fatal("Cannot open ./raul.db")
	}

	// create tables is they don't exists already
	if err := createTables(db); err != nil {
		logrus.Fatal(err)
	}

	// add dummy data if the sql table
	createDummyData(db)

	// create router and add all the routes
	router := mux.NewRouter()
	router.HandleFunc("/patient/{id}", GetPatient).Methods("GET")

	// start the server
	logrus.Printf("backend started on port %d", *port)
	logrus.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), router))
}
