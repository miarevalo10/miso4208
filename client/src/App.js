import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Reportscreen from './screens/reportscreen.js';
import Home from './screens/homescreen.js';
import NewTestRun from './screens/NewTestRun.js';
import CreateApplication from './screens/CreateApplication.js';
import ReportDetail from './screens/ReportDetail/ReportDetail.js';
import ApplicationDetail from './screens/applicationDetail/ApplicationDetail';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';


class App extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <Router>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">Automated testing</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem className="nav-item active">
                <NavLink href="/sendmessage">Home</NavLink>
              </NavItem >
              <NavItem className="nav-item active">
                <NavLink href="/create-application">Create application</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <br />

        <Route exact path="/" component={Home} />
        <Route path="/about" component={Reportscreen} />
        <Route path="/details" component={ApplicationDetail} />
        <Route path="/process-details" component={ReportDetail} />
        <Route path="/sendmessage" component={Home} />
        <Route path="/new-test" component={NewTestRun} />
        <Route path="/create-application" component={CreateApplication} />
      </Router>
    );
  }
}

export default App;
