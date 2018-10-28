import React, { Component } from 'react';
import Gantt from './Gantt';
import Toolbar from './Toolbar';
import MessageArea from './MessageArea';
import './App.css';

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
  constructor(props) {
    super(props);
    this.state = {
      currentZoom: 'Months',
      messages: []
    };

    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.logTaskUpdate = this.logTaskUpdate.bind(this);
    this.logLinkUpdate = this.logLinkUpdate.bind(this);
  }
  
  addMessage(message) {
    var messages = this.state.messages.slice();
    var prevKey = messages.length ? messages[0].key: 0;

    messages.unshift({key: prevKey + 1, message});
    if(messages.length > 40){
      messages.pop();
    }
    this.setState({messages});
  }

  logTaskUpdate(id, mode, task) {
    let text = task && task.text ? ` (${task.text})`: '';
    let message = `Task ${mode}: ${id} ${text}`;
    this.addMessage(message);
  }

  logLinkUpdate(id, mode, link) {
    let message = `Link ${mode}: ${id}`;
    if (link) {
      message += ` ( source: ${link.source}, target: ${link.target} )`;
    }
    this.addMessage(message)
  }

  handleZoomChange(zoom) {
    this.setState({
      currentZoom: zoom
    });
  }  
  
  render() {
    return (
      <div>
        <Toolbar
            zoom={this.state.currentZoom}
            onZoomChange={this.handleZoomChange}
        />
        <div className="gantt-container">
          <Gantt
            tasks={data}
            zoom={this.state.currentZoom}
            onTaskUpdated={this.logTaskUpdate}
            onLinkUpdated={this.logLinkUpdate}
          />
        </div>
        <MessageArea
            messages={this.state.messages}
        />
      </div>
    );
  }
}
export default App;
