import React, { Component } from 'react';
import {
    Container, Form,
    FormGroup, Label, Input,
    Button, FormText, FormFeedback,
} from 'reactstrap';
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

    handleChange = async (event) => {
        const { target } = event;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const { name } = target;
        console.log("name: " + name + ", value: " + value);
        await this.setState({
            [name]: value,
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

    submitForm = (event) => {
        this.setState({ file: event.target.files });
        this.setState({ apkFile: event.target.files[0].name})
        console.log('handle file upload', this.state.file, 'event', event.target.files[0]);
    }

    submitApk = (event) => {
        event.preventDefault()
        if(this.state.application.type.toLowerCase() !== "web"){
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
        }
        

        const versionToAdd = {
            projectId : this.state.appKey,
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

    render() {
        return (
            <Container>
                <h1>Add new version</h1>
                <br />
                <br />
                <Form >
                    <FormGroup>
                        <Label for="exampleZip">Version name</Label>
                        <Input
                            name="versionName"
                            id="exampleZip"
                            valid={this.state.validate.nameState === 'has-success'}
                            invalid={this.state.validate.nameState === 'has-danger'}
                            onChange={(e) => {
                                this.validateName(e)
                                this.handleChange(e)
                            }} />
                            <FormText color="muted">
                                It is recomended that you use the version number of the application
                            </FormText>
                            <FormFeedback>
                                The name cannot be empty
                            </FormFeedback>
                    </FormGroup>
                        {this.renderFileUpload()}
                    <Button color="primary" onClick={this.submitApk} >Submit</Button>
                </Form>
                <br />
                <br />
            </Container>
        )
    }
}
