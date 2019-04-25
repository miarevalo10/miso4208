import React, { Component } from 'react';
import {
    ListGroup, ListGroupItem, Container,
    Badge, ListGroupItemHeading, ListGroupItemText,
    Collapse, Button, CardBody,
    Card, Row
} from 'reactstrap';
import _ from 'lodash';
import ScriptUpload from '../ScriptUpload'
import NewTestRun from '../NewTestRun'


export default class ApplicationDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            application: this.props.location.state.application,
            collapse: false,
            collapseTwo: false
        }
    }


    toggle = () => {
        if (this.state.collapse) {
            this.setState(state => ({ collapse: !state.collapse }));
        } else {
            this.setState(state => ({ collapse: !state.collapse, collapseTwo: false }));
        }

    }

    toggleTwo = () => {
        if (this.state.collapseTwo) {
            this.setState(state => ({ collapseTwo: !state.collapseTwo }));
        } else {
            this.setState(state => ({ collapseTwo: !state.collapseTwo, collapse: false }));
        }
    }

    componentDidMount() {
        console.log("componbent mounted");
    }

    renderMonkey = (process, key) => {
        var report
        if (process.report) {
            report = <a href={process.report}>See report - </a>
        }
        var events
        if (process.events) {
            events = <span>       # of events: {process.events} - </span>
        }
        var seed
        if (process.seed) {
            seed = <span>Seed: {process.seed} - </span>
        }
        var state
        if (process.state) {
            state = <span>State: {process.state} </span>
        }
        return <ListGroupItem key={key}>
            <ListGroupItemHeading>Monkey testing</ListGroupItemHeading>
            <ListGroupItemText>
                {report}
                {events}
                {seed}
                {state}</ListGroupItemText>

        </ListGroupItem>
    }

    renderBDT = (process, key) => {
        var report
        if (process.report) {
            report = <a href={process.report}>See report</a>
        }
        var state
        if (process.state) {
            state = <span> - State: {process.state}</span>
        }
        return <ListGroupItem key={key}>
            <ListGroupItemHeading>BDT testing</ListGroupItemHeading>
            <ListGroupItemText>
                {report}
                {state}
            </ListGroupItemText>
        </ListGroupItem>

    }

    renderProcesses = () => {
        const { process } = this.state.application
        return _.map(process, (value, key) => {
            if (value.type.toLowerCase() === 'random') {
                return this.renderMonkey(value, key)
            } else if (value.type.toLowerCase() === 'bdt') {
                return this.renderBDT(value, key)
            } else {
                return <ListGroupItem key={key}>
                </ListGroupItem>
            }

        })
    }

    renderBrowsers = () => {
        const { supportedBrowsers } = this.state.application
        return _.map(supportedBrowsers, (value, key) => {
            return <Badge color="secondary" key={key}>{value}</Badge>
        })
    }
    renderSdk = () => {
        const { maxSdk, minSdk } = this.state.application
        return (<div>
            <Badge color="secondary">min sdk: {minSdk}</Badge>
            <Badge color="secondary">max sdk: {maxSdk}</Badge>
        </div>
        )

    }
    renderVersions = () => {
        const { maxSdk, minSdk } = this.state.application
        return (<div>
            <Badge color="secondary">min version: {minSdk}</Badge>
            <Badge color="secondary">max version: {maxSdk}</Badge>
        </div>
        )
    }

    render() {
        const app = this.state.application;
        var badge
        if (app.type.toLowerCase() === "web") {
            badge = this.renderBrowsers()
        } else if (app.type.toLowerCase() === "android") {
            badge = this.renderSdk()
        } else if (app.typ.toLowerCase() === "ios") {
            badge = this.renderVersions()
        }
        return (
            <Container>
                <h1>
                    {app.name + " "}
                    <Badge color="primary">{app.applicationLanguage} </Badge>

                </h1>
                {badge}

                <br />
                <p>{app.applicationDescription}</p>
                <h2>Reports</h2>
                <br />
                <ListGroup>
                    {this.renderProcesses()}
                </ListGroup>
                <Row>
                    <Container>
                        <Button color="primary" onClick={this.toggle} style={{ marginBottom: '1rem' }}>New test</Button>
                    
                        <Button color="primary" onClick={this.toggleTwo} style={{ marginBottom: '1rem' }}>Upload script</Button>
                    </Container>

                </Row>

                <Collapse isOpen={this.state.collapse}>
                    <Card>
                        <NewTestRun application={app} />
                    </Card>
                </Collapse>

                <Collapse isOpen={this.state.collapseTwo}>
                    <Card>
                        <ScriptUpload application={app} />
                    </Card>
                </Collapse>

            </Container>
        )
    }
}
