import React, { Component } from 'react';
import {
    ListGroup, ListGroupItem, Container,
    Badge, ListGroupItemHeading, ListGroupItemText,
    Collapse, Button, Card,
    Row,
} from 'reactstrap';
import _ from 'lodash';
import NewTestRun from '../NewTestRun';
import { Link } from "react-router-dom";
import axios from "axios";
import Vrtscreen from '../vrtscreen';
import AddNewVersion from '../../AddNewVersion';


export default class ApplicationDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            application: this.props.location.state.application,
            appKey: this.props.location.state.key,
            collapse: false,
            collapseTwo: false,
            collapseThree: false,
        }
    }

    toggle = () => {
        if (this.state.collapse) {
            this.setState(state => ({ collapse: !state.collapse }));
        } else {
            this.setState(state => ({
                collapse: !state.collapse,
                collapseTwo: false,
                collapseThree: false
            }));
        }

    }

    toggleTwo = () => {
        if (this.state.collapseTwo) {
            this.setState(state => ({ collapseTwo: !state.collapseTwo }));
        } else {
            this.setState(state => ({
                collapseTwo: !state.collapseTwo,
                collapse: false,
                collapseThree: false
            }));
        }
    }

    toggleThree = () => {
        if (this.state.collapseThree) {
            this.setState(state => ({ collapseThree: !state.collapseThree }));
        } else {
            this.setState(state => ({
                collapseThree: !state.collapseThree,
                collapse: false,
                collapseTwo: false
            }));
        }
    }

    renderMonkey = (process, key, version) => {
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
        const { state } = process;
        if (state) {
            stateHTML = <span>State: {process.state} </span>
            if (state === "Terminated" || state === "Finished") {
                color = "success"
            } else if (state === "Running" || state === "In progress") {
                color = "info"
            } else if (state === "Sent") {
                color = "warning"
            } else if (state === "Failed") {
                color = "danger"
            }
        }
        var title = "Monkey testing"
        if (version) {
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
        const { state } = process;

        var stateHTML
        var color
        if (state) {
            stateHTML = <span>State: {process.state} </span>
            if (state === "Terminated" || state === "Finished") {
                color = "success";
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

            } else if (state === "Running" || state === "In progress") {
                color = "info"
            } else if (state === "Sent") {
                color = "warning"
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

    renderVRT = (process, key) => {
        const { state } = process;

        var stateHTML;
        var color;
        if (state) {
            stateHTML = <span>State: {process.state} </span>
            if (state === "Terminated" || state === "Finished") {
                color = "success";
                var report = <Link to={{
                    pathname: '/vrt-report',
                    state: {
                        appKey: this.state.appKey,
                        vrtKey: key
                    }
                }}>
                    See report
                </Link>

            } else if (state === "Running" || state === "In progress") {
                color = "info"
            } else if (state === "Sent") {
                color = "warning"
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
        console.log('application',this.state.application);
        // const { process } = this.state.application;
        // if (process) {
        //     return _.map(process, (value, key) => {
        //         if (value.type.toLowerCase() === 'random') {
        //             return this.renderMonkey(value, key)
        //         } else if (value.type.toLowerCase() === 'bdt' || value.type.toLowerCase() === 'calabash') {
        //             return this.renderBDT(value, key)
        //         } else {
        //             return <ListGroupItem key={key}>
        //             </ListGroupItem>
        //         }

        //     })
        // }
        const { versions } = this.state.application;
        if (versions) {
            return _.map(versions, (version, key) => {
                const { process } = version;
                return _.map(process, (value, key) => {
                    if (value.type && (value.type.toLowerCase() === 'random' || value.type.toLowerCase() === 'monkey')) {
                        return this.renderMonkey(value, key, version)
                    } else if (value.type && (value.type.toLowerCase() === 'bdt' || value.type.toLowerCase() === 'calabash')) {
                        return this.renderBDT(value, key)
                    } else {
                        var stateHTML
                        var color
                        const { state } = value;
                        if (state) {
                            stateHTML = <span>State: {value.state} </span>
                            if (state === "Terminated" || state === "Finished") {
                                color = "success"
                            } else if (state === "Running" || state === "In progress") {
                                color = "info"
                            } else if (state === "Sent") {
                                color = "warning"
                            } else if (state === "Failed") {
                                color = "danger"
                            }
                        }
                        return <ListGroupItem key={key} color={color}>
                            {stateHTML} - Version: {version.name}
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

    handleChange = async (event) => {
        const { target } = event;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const { name } = target;
        console.log("name: " + name + ", value: " + value);
        await this.setState({
            [name]: value,
        });
    }

    handleApkUpload = (event) => {
        this.setState({ file: event.target.files });
        this.setState({ apkFile: event.target.files[0].name })
        console.log('handle file upload', this.state.file, 'event', event.target.files[0]);
    }

    submitApk = () => {
        const formData = new FormData();

        formData.append('file', this.state.file[0]);
        formData.append('timestamp', new Date())
        axios.post("http://localhost:3001/api/apk-upload", formData, {
            headers: {
                'Content-Type': 'application/apk'
            }
        }).then(response => {
            console.log('res fileupload', response)

            this.setState({
                success: true,
                message: "File upload succesfully"
            });
        }).catch(error => {
            console.log(error)
            this.setState({
                success: true,
                message: error.message
            });
        });

        const versionToAdd = {
            projectId: this.state.appKey,
            version: {
                apkFile: this.state.apkFile,
                createdDate: new Date(),
                name: this.state.versionName
            }
        }
        axios.post("http://localhost:3001/applications/addVersion", versionToAdd)
            .then(response => {
                console.log('Version added', response)
                alert('Version added');

            }).catch(error => {
                console.log(error)
                alert('There was a problem adding the version');
            });
    }

    renderVersionsOfApp = () => {
        const { versions } = this.state.application
        if (versions) {
            return _.map(versions, (value, key) => {
                var date = value.createdDate ? " - Uploaded on: " + this.formatDate(new Date(value.createdDate)) : ""
                return <ListGroupItem key={key}>{value.name} {date}</ListGroupItem>
            })
        }
    }

    formatDate = (date) => {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
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
                <br />
                <br />
                <h2>Versions</h2>
                <br />
                <ListGroup>
                    {this.renderVersionsOfApp()}
                </ListGroup>
                <br />
                <br />
                <Row>
                    <Container>
                        <Button outline size="lg" color="primary" onClick={this.toggle} style={{ marginBottom: '1rem' }}>New test</Button>

                        <Button outline size="lg" color="primary" onClick={this.toggleTwo} style={{ marginBottom: '1rem' }}>Add new version</Button>

                        <Button outline size="lg" color="primary" onClick={this.toggleThree} style={{ marginBottom: '1rem' }}>Run vrt</Button>
                    </Container>

                </Row>

                <Collapse isOpen={this.state.collapse}>
                    <Card>
                        <NewTestRun application={app} appKey={this.state.appKey} />
                    </Card>
                </Collapse>

                <Collapse isOpen={this.state.collapseTwo}>
                    <Card>
                        <AddNewVersion application={app} appKey={this.state.appKey} />
                        {/*
                            Version Name
                            <Input
                                name="versionName"
                                id="exampleZip"
                                onChange={(e) => {
                                    this.handleChange(e)
                                }} />
                        <Label for="exampleZip">Upload apk </Label>
                            <input label='upload file' type='file' onChange={this.handleApkUpload} />
                        <button className="btn btn-primary" onClick={this.submitApk} >Upload</button>
                            */}
                    </Card>
                </Collapse>

                <Collapse isOpen={this.state.collapseThree}>
                    <Card>
                        <Vrtscreen application={app} projectId={this.state.appKey} />
                    </Card>
                </Collapse>
                <br />
                <br />
            </Container>
        )
    }
}
