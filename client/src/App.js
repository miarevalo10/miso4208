import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Vrtscreen from './screens/vrtscreen.js';
import Reportscreen from './screens/reportscreen.js';
import Home from './screens/homescreen.js';
import NewTestRun from './screens/NewTestRun.js';
import CreateApplication from './screens/CreateApplication.js';


class App extends Component {
  render() {
    return (
      <Router>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <a className="navbar-brand" href="/">Navbar</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul lass="navbar-nav mr-auto">
            <li className="nav-item active">
                <Link  to="/new-test">New test</Link>
              </li>
              <li className="nav-item active">
                <Link  to="/">vrt</Link>
              </li>
              <li className="nav-item active">
                <Link  to="/about">Reportes</Link>
              </li >
              <li className="nav-item active">
                <Link  to="/sendmessage">Home</Link>
              </li >
              <li className="nav-item active">
                <Link  to="/create-application">Create application</Link>
              </li>
            </ul>
          </div>
        </nav>
        <br />
        <Route exact path="/" component={Vrtscreen} />
        <Route path="/about" component={Reportscreen} />
        <Route path="/sendmessage" component={Home} />
        <Route path="/topics" component={Topics} />
        <Route path="/new-test" component={NewTestRun} />
        <Route path="/create-application" component={CreateApplication} />
      </Router>
    );
  }
}

function Topics({ match }) {
  return (
    <div>
      <h2>Topics</h2>
      <ul>
        <li>
          <Link to={`${match.url}/rendering`}>Rendering with React</Link>
        </li>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
        </li>
      </ul>

      <Route path={`${match.path}/:topicId`} component={Topic} />
      <Route
        exact
        path={match.path}
        render={() => <h3>Please select a topic.</h3>}
      />
    </div>
  );
}

function Topic({ match }) {
  return (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
  );
}




export default App;
