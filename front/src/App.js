import {
    HashRouter as Router, Route, Link
} from 'react-router-dom';


import React, { Component } from 'react';
import Form from './Form';
import View from './View';
import './App.css';


class App extends Component {
    constructor() {
	super();
    }


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
  <Route path='/view' component={View} />
  </div>
  </Router>
    );
  }
}
export default App;
