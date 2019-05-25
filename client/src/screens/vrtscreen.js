import React, { Component } from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import {
    Container, Form,
    FormGroup, Label, Input,
    Button, Collapse
} from 'reactstrap';
import _ from 'lodash';

export default class Vrtscreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            application: this.props.application,
            versions: [],
            versionOne: "",
            versionTwo: "",
            processOne: "",
            processTwo: "",
            type:"",
            collapseTwo: false,
            collapseThree: false,
            collapseFour: false,
            collapseFifth: false,
            projectId: this.props.projectId
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeProcessOne = this.handleChangeProcessOne.bind(this);
        this.handleChangeProcessTwo = this.handleChangeProcessTwo.bind(this);
        this.handleChangeVersionOne = this.handleChangeVersionOne.bind(this);
        this.handleChangeVersionTwo = this.handleChangeVersionTwo.bind(this);

    }

    changeVisibilitySecondPart(show) {
        this.setState(state => ({ collapseTwo: show }));
    }
    changeVisibilityThirdPart(show) {
        this.setState(state => ({ collapseThree: show }));
    }
    changeVisibilityFourthPart(show) {
        this.setState(state => ({ collapseFour: show }));
    }
    changeVisibilityFifthPart(show) {
        this.setState(state => ({ collapseFifth: show }));
    }

    componentDidMount() {
        var versions = [];
        _.map(this.state.application.versions, (value, key) => {
            value.key = key;
            versions.push(value)
        })
        this.setState({ versions });

    }

    sendMsg() {
        axios.post("http://localhost:3001/api/sendvrt", {
        });
        axios.post("http://localhost:3001/api/sendvrt")
    };

    handleChange = async (event) => {
        const { target } = event;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const { name } = target;
        await this.setState({
            [name]: value,
        });
    }

    handleChangeVersionOne = (event) => {
        const { target } = event;
        console.log('event', event, 'target', target.value)
        const { versions } = this.state;
        var version = versions.find((ele) => { return ele.key === target.value })
        console.log('verions 1', version);
        this.setState({
            versionOne: version,
        });
    }

    handleChangeVersionTwo = (event) => {
        const { target } = event;
        const { versions } = this.state
        var version = versions.find((ele) => { return ele.key === target.value })
        this.setState({
            versionTwo: version,
        });
    }

    handleChangeProcessOne = (event) => {
        const { target } = event;
        const { process } = this.state.versionOne
        console.log("process one:", process)
        var toSave;
        _.forEach(process, (value, key) => {
            console.log('value', value, 'key', key)
            if (key === target.value) {
                toSave = value;
                toSave.key = key;
                this.setState({
                    processOne: toSave
                });
                return;
            }
        })
        console.log('to save', toSave);
        this.setState({
            processOneKey: toSave
        });
    }

    handleChangeProcessTwo = (event) => {
        const { target } = event;
        const { process } = this.state.versionTwo
        var toSave;
        var toSaveKey;
        _.forEach(process, (value, key) => {
            if (key === target.value) {
                toSave = value;
                toSave.key = key;
                this.setState({
                    processTwo: toSave
                });
                return;
            }
        })

    }

    renderVersions = () => {
        const { versions } = this.state;
        return versions.map((version) => {
            return <option value={version.key} key={version.key}>{version.name}</option>
        })
    }

    renderProcesses = () => {
        const { process } = this.state.versionOne

        return _.map(process, (value, key) => {
            return <option value={key} key={key}>{value.lastUpdate} - {value.state}</option>
        })
    }

    renderProcessesTwo = () => {
        const { process } = this.state.versionTwo
        return _.map(process, (value, key) => {
            return <option value={key} key={key}>{value.lastUpdate} - {value.state}</option>
        })
    }


    submitForm = (e) => {
        let type = '';
        if(this.state.application.type ==='Android') {
            type = 'calabash';
        } else if (this.state.application.type === 'web'){
            type= 'cypress'
        }

        e.preventDefault();
        console.log("submit", this.state);
        const test = {
            projectId : this.state.projectId,
            versionOneId: this.state.versionOne.key,
            versionTwoId: this.state.versionTwo.key,
            processOneId: this.state.processOne.key,
            processTwoId: this.state.processTwo.key,
            type: type,
            queue: 'vrt'
        }
        console.log('TESTT', test);
        axios.post("http://localhost:3001/api/sendTest", test).then(response => {
            console.log('response', response);
            alert("The test was submitted succesfully!");
        }).catch(error => {
            console.log(error)
            alert("There was an error creating your test");
        });
    }

    checkCanSubmitForm = () => {
        const {
            versionOne,
            versionTwo,
            processOne,
            processTwo,
            collapseFifth
        } = this.state
        return (
            collapseFifth
            && versionOne
            && versionTwo
            //&& versionOne!==versionTwo
            && processOne
            && processTwo
            && processOne.file === processTwo.file
            && processOne.type === processTwo.type

        )
    }


    render() {
        return (
            <Container>
                <Form onSubmit={(e) => this.submitForm(e)}>
                    <FormGroup>
                        <Label for="exampleSelect">Original version</Label>
                        <Input
                            type="select"
                            name="versionOne"
                            id="versionOne"
                            onChange={(e) => {
                                this.handleChangeVersionOne(e)
                                this.changeVisibilitySecondPart(true)
                            }}>
                            <option selected disabled>Select option</option>
                            {this.renderVersions()}
                        </Input>
                    </FormGroup>
                    <Collapse isOpen={this.state.collapseTwo}>
                        <FormGroup>
                            <Label for="exampleSelect">Process of original version</Label>
                            <Input
                                type="select"
                                name="processOne"
                                id="processOne"
                                onChange={(e) => {
                                    this.handleChangeProcessOne(e)
                                    this.changeVisibilityThirdPart(true)
                                }}>
                                <option selected disabled>Select option</option>
                                {this.renderProcesses()}
                            </Input>
                        </FormGroup>
                    </Collapse>
                    <Collapse isOpen={this.state.collapseThree}>
                        <FormGroup>
                            <Label for="exampleSelect">Version to compare</Label>
                            <Input
                                type="select"
                                name="versionTwo"
                                id="versionTwo"
                                onChange={(e) => {
                                    this.handleChangeVersionTwo(e)
                                    this.changeVisibilityFourthPart(true)
                                }}>
                                <option selected disabled>Select option</option>
                                {this.renderVersions()}
                            </Input>
                        </FormGroup>
                    </Collapse>
                    <Collapse isOpen={this.state.collapseFour}>
                        <FormGroup>
                            <Label for="exampleSelect">Process of version to compare</Label>
                            <Input
                                type="select"
                                name="processTwo"
                                id="processTwo"
                                onChange={(e) => {
                                    this.handleChangeProcessTwo(e)
                                    this.changeVisibilityFifthPart(true)
                                }}>
                                <option selected disabled>Select option</option>
                                {this.renderProcessesTwo()}
                            </Input>
                        </FormGroup>
                    </Collapse>
                    <Collapse isOpen={this.checkCanSubmitForm()}>
                        {/* <Link to={{
                pathname: '/vrt-report',
                state: {
                    versionOne: this.state.versionOne,
                    versionTwo: this.state.versionTwo,
                    processOne: this.state.processOne,
                    processTwo: this.state.processTwo
                }
            }}> */}
                        <Button type="submit" color="primary">Run vrt</Button>
                        {/* </Link> */}
                    </Collapse>
                </Form>
            </Container>
        );
    }
}
