import React, { Component } from 'react';
import axios from "axios";
import _ from 'lodash';
import { ListGroup, ListGroupItem, Container } from 'reactstrap';
import { Link } from "react-router-dom";

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            applications: [],
        }
    }

    componentDidMount() {
        console.log("componbent mounted");
        this.getApplicationsFromDB();
    }

    getApplicationsFromDB = () => {
        console.log("get applications")
        axios.get("http://localhost:3001/applications").then((res) => {
            console.log("res", res.data);
            this.setState({ applications: res.data });
        });
    }

    renderApplications = () => {
        console.log('state', this.state)
        const { applications } = this.state;
        console.log(applications)
        return _.map(applications, (value, key) => {
            return (<ListGroupItem
                action
                key={key}>
                <Link to={{
                    pathname: '/details',
                    state: {
                        application: value
                    }
                }}>
                    {value.name}
                </Link>
            </ListGroupItem>);
        })
    }

    render() {
        return (
            <Container className="App">
                <h1>Applications</h1>
                <br />
                <div >
                    <ListGroup>
                        {this.renderApplications()}
                    </ListGroup>
                </div>
            </Container>
        );

    }
}
