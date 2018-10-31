package main

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
)

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

func createFakeData(db *sql.DB) error {
	statement, _ := db.Prepare("INSERT INTO patients (Firstname, Lastname) VALUES (?, ?)")
	statement.Exec("Joe", "Dalton")
	statement.Exec("William", "Dalton")
	statement.Exec("Jack", "Dalton")
	statement.Exec("Averell", "Dalton")

	statement, _ = db.Prepare("INSERT INTO medications (label) VALUES (?)")
	statement.Exec("Clopidogrel")
	statement.Exec("ASA")
	statement.Exec("Rivaroxaban")

	statement, _ = db.Prepare("INSERT INTO prescriptions(patient_id, medication_id, start_date, duration, parent) VALUES (?, ?, ?, ?, ?)")
	statement.Exec(1, 1, "02-02-2018 00:00", 365, 0)
	statement.Exec(1, 2, "02-02-2018 00:00", 0, 0)
	statement.Exec(1, 2, "02-02-2018 00:00", 30, 2)
	statement.Exec(1, 2, "02-04-2018 00:00", 10, 2)
	statement.Exec(1, 2, "02-06-2018 00:00", 30, 2)
	statement.Exec(1, 2, "02-08-2018 00:00", 10, 2)
	statement.Exec(1, 3, "02-02-2018 00:00", 365, 0)
	return nil
}

type gantt struct {
	ID        int    `json:"id,omitempty"`
	Text      string `json:"text,omitempty"`
	StartDate string `json:"start_date,omitempty"`
	Type      string `json:"type,omitempty"`
	Duration  int    `json:"duration,omitempty"`
	Parent    int    `json:"parent,omitempty"`
	Open      bool   `json:"open,omitempty"`
}

func GetPatient(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	rows, err := db.Query("SELECT prescriptions.ID, medication_id, start_date, duration, parent, label FROM prescriptions, medications WHERE medication_id = medications.id AND patient_id = " + id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var medication_id int

	resp := struct {
		Data []gantt `json:"data"`
	}{}

	for rows.Next() {
		g := gantt{}
		err = rows.Scan(&g.ID, &medication_id, &g.StartDate, &g.Duration, &g.Parent, &g.Text)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		if g.Duration == 0 {
			g.Type = "project"
			g.Open = false
		}
		resp.Data = append(resp.Data, g)
	}
	rows.Close()
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(resp)
}

var db *sql.DB

func main() {
	logrus.SetLevel(logrus.DebugLevel)
	var err error
	db, err = sql.Open("sqlite3", "./raul.db")
	if err != nil {
		logrus.Fatal("Cannot open ./raul.db")
	}

	if err := createTables(db); err != nil {
		logrus.Fatal(err)
	}

	if err := createFakeData(db); err != nil {
		logrus.Fatal(err)
	}

	router := mux.NewRouter()
	router.HandleFunc("/patient/{id}", GetPatient).Methods("GET")

	logrus.Print("backend started on port 7778")
	logrus.Fatal(http.ListenAndServe(":7778", router))
}
