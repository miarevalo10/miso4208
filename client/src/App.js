import React, { Component } from 'react';
import './App.css';
import axios from "axios";

class App extends Component {

  sendMsg(msg){
   
    axios.post("http://localhost:3001/api/sendTest", {
      message: msg
    });
  };

  render() {
    return (
      <div className="App">
        <button onClick={() => this.sendMsg('ubicacion test')}>Send Msg</button>
      </div>
    );
  }
}

export default App;
