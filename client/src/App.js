import React, { Component } from 'react';
import './App.css';
import axios from "axios";

class App extends Component {

  sendMsg(){
    var msg = {
      "apkName": "me.kuehle.carreport_79.apk",
      "events" : "1000",
      "packageName" : "me.kuehle.carreport"
    }
    console.log('test', msg);
   
    axios.post("http://localhost:3001/api/sendTest", {
      message: msg
    });
  };

  render() {
    return (
      <div className="App">
        <button onClick={() => this.sendMsg()}>Send Msg</button>
      </div>
    );
  }
}

export default App;
