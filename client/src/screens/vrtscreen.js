import React, { Component } from 'react';
import axios from "axios";
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
            versions:[],
            versionOne: "",
            versionTwo: "",
            processOne: "",
            processTwo: "",
            collapseTwo:false,
            collapseThree: false,
            collapseFour: false,
            collapseFifth: false,
        }
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
            value.key=key;
            versions.push(value)
        })
        this.setState({versions});
        
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
        const {versions} = this.state
        var version = versions.find((ele)=> { return ele.key===target.value})
        this.setState({
            versionOne:version,
        });
    }

    handleChangeVersionTwo = (event) => {
        const { target } = event;
        const {versions} = this.state
        var version = versions.find((ele)=> { return ele.key===target.value})
        this.setState({
            versionTwo:version,
        });
    }

    handleChangeProcessOne = (event) => {
        const { target } = event;
        const {process} = this.state.versionOne
        console.log("process one:",process)
        var toSave 
         _.forEach(process,  (value,key) =>  {
             if(key===target.value) {
                 toSave = value
                }
        })
        this.setState({
            processOne:toSave,
        });
    }

    handleChangeProcessTwo = (event) => {
        const { target } = event;
        const {process} = this.state.versionTwo
        var toSave 
         _.forEach(process,  (value,key) =>  {
             if(key===target.value) {
                 toSave = value
                }
        })
        this.setState({
            processTwo:toSave,
        });
    }

    renderVersions = () => {
        const {versions} = this.state;
        return versions.map((version) => {
            return <option value={version.key} key={version.key}>{version.name}</option>
        })
    }

    renderProcesses = () => {
        const {process} = this.state.versionOne
        return _.map(process, (value,key) => {
            return <option value={key} key={key}>{value.state}</option>
        })
    }

    renderProcessesTwo = () => {
        const {process} = this.state.versionTwo
        return _.map(process, (value,key) => {
            return <option value={key} key={key}>{value.state}</option>
        })
    }


    submitForm = (e) => {
        e.preventDefault();
        console.log("submit",this.state)
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
            && versionOne!==versionTwo
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
                        <Button color="primary">Run vrt</Button>
                    </Collapse>
                </Form>
            </Container>
        );
    }
}
