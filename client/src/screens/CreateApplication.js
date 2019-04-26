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
import FileUpload from './FileUpload';

export default class CreateApplication extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'name': '',
            'type': 'Web',
            'applicationArchitecture': 'MVP',
            'applicationLanguage': 'Java',
            'applicationVersion': '',
            'applicationDescription': '',
            'minSdk': 1,
            'maxSdk': 28,
            'supportedBrowsers': [],
            'browserVersion': '',
            'browserName': '',
            'versionName': '',
            'apkFile' : '',
            //versions : [{name:'', apkFile:'', createdDate:''}],
            validate: {
                nameState: '',
                typeState: '',
                architectureState: '',
                languageState: '',
                versionState: '',
                sdkState: '',
                browserNameState: '',
                browserVersionState: '',
            },
            file: null,
            success: false,
            message: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.isEmpty = this.isEmpty.bind(this);
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

    validateField = (e, field) => {
        const { validate } = this.state
        if (!this.isEmpty(e.target.value)) {
            validate[field] = 'has-success'
        } else {
            validate[field] = 'has-danger'
        }
        this.setState({ validate })
    }

    validateSdk = (e, field) => {
        const { validate } = this.state
        if (!this.isEmpty(e.target.value)
            && e.target.value > 0
            && e.target.value <= 28) {
            validate[field] = 'has-success'
        } else {
            validate[field] = 'has-danger'
        }
        this.setState({ validate })
    }
    validateVersion = (e, field) => {
        const { validate } = this.state
        if (!this.isEmpty(e.target.value)
            && e.target.value > 0
            && e.target.value <= 100) {
            validate[field] = 'has-success'
        } else {
            validate[field] = 'has-danger'
        }
        this.setState({ validate })
    }

    addBrowser = (e) => {
        const { browserName, browserVersion, supportedBrowsers } = this.state;
        if (!this.isEmpty(browserName) && browserVersion) {
            const toAdd = browserName.toUpperCase() + '-' + browserVersion;
            if (!supportedBrowsers.includes(toAdd)) {
                supportedBrowsers.push(toAdd)
                this.setState({ supportedBrowsers })
            }
        }
    }

    isEmpty = (str) => {
        return (!str || 0 === str.length);
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
        this.setState({ apkFile: event.target.files[0].name})
        console.log('handle file upload', this.state.file, 'event', event.target.files[0]);

    }

    submitForm(e) {
        e.preventDefault();
        console.log(this.state);
        this.submitFile();
        const versionsObj = [{name: this.state.versionName, apkFile: this.state.apkFile, createdDate: new Date()}];
        axios.post("http://localhost:3001/applications/create", {
            name: this.state.name,
            type: this.state.type,
            applicationArchitecture: this.state.applicationArchitecture,
            applicationDescription: this.state.applicationDescription,
            applicationLanguage: this.state.applicationLanguage,
            minSdk: this.state.minSdk,
            maxSdk: this.state.maxSdk,
            supportedBrowsers: this.state.supportedBrowsers,
            versions: versionsObj
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

    renderRedirect = () => {
          return <Redirect to="/sendmessage" />
      }

    renderSupportedBrowsers = () => {
        const { supportedBrowsers } = this.state
        if (supportedBrowsers.length === 0) {
            return (<p muted>There isn't any browser on the list</p>);
        } else {
            return this.state.supportedBrowsers.map((browser) => {
                return <ListGroupItem key={browser}>{browser}</ListGroupItem >
            });
        }
    }


    renderSupportedPlatforms() {
        const { type,
            minSdk,
            maxSdk,
            browserVersion,
            browserName } = this.state;
        if (type === 'Android') {
            return (
                <FormGroup>
                    <Row form>
                        <Col md={2}>
                            <Label for="exampleZip">Min SDK</Label>
                            <Input
                                min="1"
                                max="28"
                                type="number"
                                name="minSdk"
                                id="exampleZip"
                                value={minSdk}
                                valid={this.state.validate.sdkState === 'has-success'}
                                invalid={this.state.validate.sdkState === 'has-danger'}
                                onChange={(e) => {
                                    this.handleChange(e)
                                    this.validateSdk(e, 'sdkState')
                                }} />
                        </Col>
                        <Col md={2}>
                            <Label for="exampleZip">Max SDK</Label>
                            <Input
                                min="1"
                                max="28"
                                type="number"
                                name="maxSdk"
                                id="exampleZip"
                                value={maxSdk}
                                valid={this.state.validate.sdkState === 'has-success'}
                                invalid={this.state.validate.sdkState === 'has-danger'}
                                onChange={(e) => {
                                    this.handleChange(e)
                                    this.validateSdk(e, 'sdkState')
                                }} />
                        </Col>
                        <Col md={2}>
                            <Label for="exampleZip">Version name</Label>
                            <Input
                                name="versionName"
                                id="exampleZip"
                                valid={this.state.validate.versionState === 'has-success'}
                                invalid={this.state.validate.versionState === 'has-danger'}
                                onChange={(e) => {
                                    this.handleChange(e)
                                    this.validateSdk(e, 'versionState')
                                }} />
                        </Col>
                        <Col md={4}>
                        <Label for="exampleZip">Upload apk </Label>
                            <input label='upload file' type='file' onChange={this.handleFileUpload} />
                        </Col>
                        <FormFeedback valid>
                            Valid range
                    </FormFeedback>
                        <FormFeedback>
                            Invalid range
                    </FormFeedback>
                    </Row>
                </FormGroup>


            );
        } else if (type === 'Web') {
            return (
                <div>
                    <FormGroup>
                        <Label>Browsers the application can run on</Label>
                        <InputGroup>
                            <Input
                                min="1"
                                type="text"
                                name="browserName"
                                id="browserName"
                                placeholder="Browser name"
                                value={browserName}
                                valid={this.state.validate.browserNameState === 'has-success'}
                                invalid={this.state.validate.browserNameState === 'has-danger'}

                                onChange={(e) => {
                                    this.validateField(e, 'browserNameState')
                                    this.handleChange(e)
                                }} />
                            <Input
                                min="1"
                                type="number"
                                name="browserVersion"
                                id="browserVersion"
                                placeholder="version"
                                value={browserVersion}
                                valid={this.state.validate.browserVersionState === 'has-success'}
                                invalid={this.state.validate.browserVersionState === 'has-danger'}
                                onChange={(e) => {
                                    this.validateVersion(e, 'browserVersionState')
                                    this.handleChange(e)
                                }} />
                            <InputGroupAddon addonType="append">
                                <Button
                                    color="secondary"
                                    onClick={this.addBrowser}>Add browser</Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                    <Col>
                        <FormGroup>
                            <ListGroup>
                                {this.renderSupportedBrowsers()}
                            </ListGroup>
                        </FormGroup>
                    </Col>
                </div>
            );
        } else {
            return (
                <FormGroup>
                    <Row form>
                        <Col md={2}>
                            <Label for="exampleZip">Min version</Label>
                            <Input
                                min="1"
                                max="28"
                                type="number"
                                name="minSdk"
                                id="exampleZip"
                                value={minSdk}
                                valid={this.state.validate.sdkState === 'has-success'}
                                invalid={this.state.validate.sdkState === 'has-danger'}
                                onChange={(e) => {
                                    this.handleChange(e)
                                    this.validateSdk(e, 'sdkState')
                                }} />
                        </Col>
                        <Col md={2}>
                            <Label for="exampleZip">Max version</Label>
                            <Input
                                min="1"
                                max="28"
                                type="number"
                                name="maxSdk"
                                id="exampleZip"
                                value={maxSdk}
                                valid={this.state.validate.sdkState === 'has-success'}
                                invalid={this.state.validate.sdkState === 'has-danger'}
                                onChange={(e) => {
                                    this.handleChange(e)
                                    this.validateSdk(e, 'sdkState')
                                }} />
                        </Col>

                        <FormFeedback valid>
                            Valid range
                    </FormFeedback>
                        <FormFeedback>
                            Invalid range
                    </FormFeedback>
                    </Row>
                </FormGroup>

            );
        }
    }

    render() {
        console.log(this.state)
        const {
            name,
            type,
            applicationArchitecture,
            applicationLanguage } = this.state;
        return (
            <Container className="App">
                <h2>Create Application</h2>
                <Form className="form" onSubmit={(e) => this.submitForm(e)}>
                    <Col>
                        <FormGroup>
                            <Label>Application name</Label>
                            <Input
                                type="name"
                                name="name"
                                id="name"
                                value={name}
                                valid={this.state.validate.nameState === 'has-success'}
                                invalid={this.state.validate.nameState === 'has-danger'}
                                onChange={(e) => {
                                    this.validateName(e)
                                    this.handleChange(e)
                                }}
                                maxLength="40"
                            />
                            <FormFeedback valid>
                                That's a valid application name
                            </FormFeedback>
                            <FormFeedback>
                                The name of your app should not be empty
                            </FormFeedback>
                            <FormText>The application name should not contain any version number.</FormText>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Label for="applicationDescription">Description</Label>
                            <Input
                                type="textarea"
                                name="applicationDescription"
                                id="applicationDescription"
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                maxLength="300" />
                            <FormText>The description can be empty. 300 max.</FormText>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Label for="type">Select type of application</Label>
                            <Input
                                type="select"
                                name="type"
                                id="type"
                                value={type}
                                onChange={(e) => {
                                    this.validateField(e, 'typeState')
                                    this.handleChange(e)
                                }}>
                                <option>Web</option>
                                <option>Android</option>
                                <option>iOS</option>
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Label for="applicationArchitecture">Select architecture of application</Label>
                            <Input
                                type="select"
                                name="applicationArchitecture"
                                id="applicationArchitecture"
                                value={applicationArchitecture}
                                onChange={(e) => {
                                    this.validateField(e, 'architectureState')
                                    this.handleChange(e)
                                }}>
                                <option>MVP</option>
                                <option>MVVM</option>
                                <option>MVC</option>
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Label for="applicationLanguage">Language of the application</Label>
                            <Input
                                type="select"
                                name="applicationLanguage"
                                id="applicationLanguage"
                                value={applicationLanguage}
                                onChange={(e) => {
                                    this.validateField(e, 'languageState')
                                    this.handleChange(e)
                                }}>
                                <option>Java</option>
                                <option>Kotlin</option>
                                <option>PHP</option>
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col>
                        {this.renderSupportedPlatforms()}
                    </Col>
                    <Button>Submit</Button>
                </Form>
            </Container>
        );
    }
}
