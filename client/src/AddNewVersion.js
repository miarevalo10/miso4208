import React, { Component } from 'react';
import {
    Container, Col, Form,
    FormGroup, Label, Input,
    Button, FormText, FormFeedback,
    Row, InputGroupAddon, InputGroup,
    ListGroup, ListGroupItem
} from 'reactstrap';
import { Redirect } from 'react-router-dom';
import axios from "axios";

export default class AddNewVersion extends Component {

    constructor(props) {
        super(props)
        console.log(this.props.application)
        this.state = {
            application: this.props.application,
            appKey: this.props.appKey,
            versionName: '',
            file: null,
            apkFile:'',
            validate: {
                nameState: '',
                typeState: '',
            },
            success: false,
            message: ""
        }
    }

    submitFile = () => {
        //event.preventDefault();
        const formData = new FormData();
        //                'Content-Type': 'multipart/form-data'

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
    }

    handleFileUpload = (event) => {
        this.setState({ file: event.target.files });
        this.setState({ apkFile: event.target.files[0].name })
        console.log('handle file upload', this.state.file, 'event', event.target.files[0]);

    }

    validateName = (e) => {
        const { validate } = this.state
        if (!this.isEmpty(e.target.value) && e.target.value.length <= 40) {
            validate.nameState = 'has-success'
        } else {
            validate.nameState = 'has-danger'
        }
        this.setState({ validate })
    }

    renderFileUpload = () => {
        if (this.state.application.type.toLowerCase() === "web") {
            return
        } else {
            return (
                <FormGroup>
                    <Label for="exampleZip">Upload apk </Label>
                    <Input
                        name='apkFile'
                        type='file'
                        onChange={this.handleFileUpload} />
                </FormGroup>
            );
        }
    }

    isEmpty = (str) => {
        return (!str || 0 === str.length);
    }

    submitForm = (e) => {
        const versionsObj = [{name: this.state.versionName, apkFile: this.state.apkFile, createdDate: new Date()}];
        axios.post("http://localhost:3001/applications/add-version", {
            applicationId: this.state.appKey,
            name: this.state.versionName,
            apkFile: this.state.apkFile,
            createdDate: new Date(),
        }).then(response => {
            console.log('responseee', response)
            this.setState({
                success: true,
                message: "Application uploaded succesfully"
            });
            this.renderRedirect();
        }).catch(error => {
            console.log(error)
            console.log('rerror', error)
            this.setState({
                success: true,
                message: error.message
            });
        });
    }

    render() {
        return (
            <Container>
                <h1>Add new version</h1>
                <br />
                <br />
                <Form>
                    <FormGroup>
                        <Label for="exampleZip">Version name</Label>
                        <Input
                            name="versionName"
                            id="exampleZip"
                            valid={this.state.validate.nameState === 'has-success'}
                            invalid={this.state.validate.nameState === 'has-danger'}
                            onChange={(e) => {
                                this.validateName(e)
                            }} />
                            <FormText color="muted">
                                It is recomended that you use the version number of the application
                            </FormText>
                            <FormFeedback>
                                The name cannot be empty
                            </FormFeedback>
                    </FormGroup>
                        {this.renderFileUpload()}
                    <Button color="primary">Submit</Button>
                </Form>
                <br />
                <br />
            </Container>
        )
    }
}
