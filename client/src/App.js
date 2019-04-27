import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Reportscreen from './screens/reportscreen.js';
import Home from './screens/homescreen.js';
import NewTestRun from './screens/NewTestRun.js';
import CreateApplication from './screens/CreateApplication.js';
import ReportDetail from './screens/ReportDetail/ReportDetail.js';
import ApplicationDetail from './screens/applicationDetail/ApplicationDetail';


class App extends Component {
  render() {
    return (
      <Router>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
              <li className="navbar-brand active">
                <a className="navbar-brand" href="/">All applications</a>
              </li >
              <li className="navbar-brand active">
                <a className="navbar-brand" href="/create-application">Create application</a>
              </li>
            </ul>
          </div>
        </nav>
        <br />


        <Route exact path="/" component={Home} />
        <Route path="/about" component={Reportscreen} />
        <Route path="/details" component={ApplicationDetail} />
        <Route path="/process-details" component={ReportDetail} />
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