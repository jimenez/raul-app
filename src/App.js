import {
    HashRouter as Router, Route, Link
} from 'react-router-dom';


import React, { Component } from 'react';
import Form from './Form';
import View from './View';
import './App.css';

var db = require('./db.js')

db.createDb()



let data = {
        "data": [
            {"id": 1, "text": "Clopidogrel", "start_date": "02-02-2018 00:00", "duration": 365, "open": true},
            {"id": 2, "text": "ASA", "start_date": "02-02-2018 00:00", "type": "project", "open": false},
            {"id": 2.1, "text": "ASA", "start_date": "02-02-2018 00:00", "duration": 30, "parent": "2", "open": true},
            {"id": 2.2, "text": "ASA", "start_date": "02-04-2018 00:00", "duration": 10, "parent": "2", "open": true},
            {"id": 2.3, "text": "ASA", "start_date": "02-06-2018 00:00", "duration": 30, "parent": "2", "open": true},
            {"id": 2.4, "text": "ASA", "start_date": "02-08-2018 00:00", "duration": 10, "parent": "2", "open": true},
            {"id": 3, "text": "Rivaroxaban", "start_date": "02-02-2018 00:00", "duration": 365,  "open": true},
        ]
    };


class App extends Component {
  
  render() {
      return (
  <Router>
  <div>
  <ul>
  <li>
  <Link to="/">Home</Link>
  </li>
  <li>
  <Link to="/view">View</Link>
  </li>
  </ul>
  <hr/>
  <Route exact path="/" component={Form} />
  <Route path='/view' render={() => <View data={data}/>} />
  </div>
  </Router>
    );
  }
}
export default App;
