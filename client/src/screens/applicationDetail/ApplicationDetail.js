import React, { Component } from 'react';
import {
    ListGroup, ListGroupItem, Container,
    Badge, ListGroupItemHeading, ListGroupItemText,
    Collapse, Button, Card,
    Row
} from 'reactstrap';
import _ from 'lodash';
import ScriptUpload from '../ScriptUpload';
import NewTestRun from '../NewTestRun';
import { Link } from "react-router-dom";


export default class ApplicationDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            application: this.props.location.state.application,
            appKey: this.props.location.state.key,
            collapse: false,
            collapseTwo: false
        }
        console.log('app key in app detail', this.state.appKey);
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

    renderMonkey = (process, key,version) => {
        var report = <Link to={{
                pathname: '/process-details',
                state: {
                    appKey: this.state.appKey,
                    process: process,
                    processKey: key,
                    appName: this.state.application.name,

                }
            }}>
                See report
            </Link>
        
        var events
        if (process.events) {
            events = <span>       # of events: {process.events} - </span>
        }
        var seed
        if (process.seed) {
            seed = <span>Seed: {process.seed} - </span>
        }
        var stateHTML
        var color
        const {state} = process;
        if (state) {
            stateHTML = <span>State: {process.state} </span>
            if(state === "Terminated" || state === "Finished"){
                color = "success"
            } else if (state === "Running" || state === "Sent") {
                color = "info"
            } else if (state === "Failed") {
                color = "danger"
            }
        }
        console.log("color",color + " - " + process.state)
        var title = "Monkey testing"
        if(version){
            title += " on version " + version.name 
        }
        return <ListGroupItem key={key} color={color}>
            <ListGroupItemHeading>{title}</ListGroupItemHeading>
            <ListGroupItemText>
                {report}
                {events}
                {seed}
                {stateHTML}</ListGroupItemText>

        </ListGroupItem>
    }

    renderBDT = (process, key) => {
        var report = <Link to={{
                pathname: '/process-details',
                state: {
                    appKey: this.state.appKey,
                    process: process,
                    processKey: key
                }
            }}>
                See report
            </Link>
        
        var stateHTML
        var color
        const {state} = process;
        if (state) {
            stateHTML = <span>State: {process.state} </span>
            if(state === "Terminated" || state === "Finished"){
                color = "success"
            } else if (state === "Running" || state === "Sent") {
                color = "info"
            } else if (state === "Failed") {
                color = "danger"
            }
        }
        return <ListGroupItem key={key} color={color}>
            <ListGroupItemHeading>BDT testing</ListGroupItemHeading>
            <ListGroupItemText>
                {report}
                 - 
                {stateHTML}
            </ListGroupItemText>
        </ListGroupItem>

    }

    renderProcesses = () => {
        const { process } = this.state.application
        if (process) {
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
        } else {
            const { versions } = this.state.application
            return _.map(versions, (version, key) => {
                const { process } = version;
                return _.map(process, (value, key) => {
                    if (value.type && (value.type.toLowerCase() === 'random'||value.type.toLowerCase() === 'monkey')) {
                        return this.renderMonkey(value, key,version)
                    } else if (value.type && value.type.toLowerCase() === 'bdt') {
                        return this.renderBDT(value, key)
                    } else {
                        return <ListGroupItem key={key}>
                            {value.state} - Version: {version.name}
                        </ListGroupItem>
                    }

                })
            })
        }

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
                <br/>
                <br/>
                <Row>
                    <Container>
                        <Button outline size="lg" color="primary" onClick={this.toggle} style={{ marginBottom: '1rem' }}>New test</Button>

                        <Button outline size="lg" color="primary" onClick={this.toggleTwo} style={{ marginBottom: '1rem' }}>Upload script</Button>

                        <Button outline size="lg" color="primary" onClick={this.toggleTwo} style={{ marginBottom: '1rem' }}>Add new version</Button>
                    </Container>

                </Row>

                <Collapse isOpen={this.state.collapse}>
                    <Card>
                        <NewTestRun application={app} appKey={this.state.appKey} />
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
