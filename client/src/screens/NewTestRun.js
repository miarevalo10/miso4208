import React, { Component } from 'react';
import axios from "axios";
import _ from 'lodash';
import ScriptUpload from './ScriptUpload';

export default class NewTestRun extends Component {

    constructor(props) {
        super(props);
        this.state = {
            app: this.props.application,
            appKey: this.props.appKey,
            apks: [],
            apkSelected: "",
            versionKey: "",
            testsTypes: [
                "Monkey",
                "End2End",
                "Mutation",
                "Behaviour Driven",
                "Visual Regression"
            ],
            technologies: [
                "Monkey",
                "Calabash",
            ],
            technology: "Monkey",
            packageName: "",
            events: 100,
            seed: 1234
        };
        console.log('app key in new test run', this.state.appKey)
        console.log('app versions in newtestrun', this.state.app.versions);
        _.map(this.state.app.versions, (value, key) => {

            console.log('value', value, 'key', key);
        });
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeEvents = this.handleChangeEvents.bind(this);
        this.handleChangeSeed = this.handleChangeSeed.bind(this);
    }

    componentDidMount() {
        this.getAvailableApks();
    }

    getAvailableApks() {
        axios.get("http://localhost:3001/api/get-apks")
            .then((response, err) => {
                if (err) {
                    console.log(err);
                } else {
                    //       console.log(response.data.Contents);
                    this.setState({ apks: response.data.Contents });

                }
            });
    };

    onOptionChanged = (event) => {
        console.log('key', event.target.value);
        this.setState({
            apkSelected: this.state.app.versions[event.target.value].apkFile,
            versionKey: event.target.value
        });
    }

    onTechnologyOptionChanged = (event) => {
        this.setState({
            technology: event.target.value,
        });
    }

    renderListApks() {
        const { app } = this.state;
        if (app) {
            return _.map(app.versions, (value, key) => {
                return <option key={key} value={key}>{value.name}</option>
            });
        } else {
            return this.state.apks.slice(1).map((apk) => {
                var list = apk.Key.split("/")
                var key = list[1];
                return <option key={key} value={key}>{key}</option>

            })
        }

    }

    renderListTechnologies() {
        return this.state.technologies.map((tech) => {
            return <option key={tech} value={tech}>{tech}</option>
        })
    }

    renderTechnologySection() {
        switch (this.state.technology) {
            case "Monkey":
                return (
                    <div>
                        <div className="form-group">
                            <label htmlFor="events">Number of events</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={this.state.events}
                                    onChange={this.handleChangeEvents}
                                    className="form-control"
                                    id="events"
                                    required />
                                <div className="invalid-feedback">
                                    Please provide a number of events name
                            </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="seed">Seed</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={this.state.seed}
                                    onChange={this.handleChangeSeed}
                                    className="form-control"
                                    id="seed"
                                    required />
                                <div className="invalid-feedback">
                                    Please provide a number of events name
                            </div>
                            </div>
                        </div>
                    </div>);
            case "Calabash":
                return (<div className="formGroup">
                    <input label='upload file' type='file' onChange={this.handleFileUpload} />


                </div>);

            default:
                return (<div>
                </div>);
        }
    }

    submitFile = () => {
        const formData = new FormData();
        formData.append('file', this.state.file[0]);
        axios.post("http://localhost:3001/api/script-upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => {
            this.setState({
                success: true,
                message: "File upload succesfully"
            });
        }).catch(error => {
            console.log(error);
            alert("There was an error uploading the file " + error.message)
        });
    }

    handleFileUpload = (event) => {
        this.setState({ file: event.target.files });
        this.setState({ fileName: event.target.files[0].name });
    }

    renderMessage() {
        if (this.state.apkSelected === "") {
            return <h5>Please select the version you want to test</h5>
        } else {
            return <button className="btn btn-primary" type="submit">I want to run {this.state.technology} testing
            on the version {this.state.apkSelected}.</button>

        }
    }

    handleChange = (event) => {
        this.setState({ packageName: event.target.value });
    }

    handleChangeEvents = (event) => {
        console.log('handle change events', event.target.value);
        this.setState({ events: event.target.value });
        console.log('handle change events state', this.state.events);

    }

    handleChangeSeed = (event) => {
        this.setState({ seed: event.target.value });
        console.log('handle change seed', event.target.value);

        console.log('handle change seed state', this.state.events);

    }

    handleSubmit = (event) => {
        event.preventDefault();
        if(this.state.file) {
            this.submitFile();
        }
        if (this.state.apkSelected === "") {
            return;
        }
        console.log(this.state);

        let test = {};

        if (this.state.technology === 'Monkey') {
            test = {
                apkFile: this.state.apkSelected,
                queue: this.state.technology,
                packageName: this.state.packageName,
                events: this.state.events,
                seed: this.state.seed,
                projectId: this.state.appKey,
                versionKey: this.state.versionKey,
                file: this.state.fileName
            }
        } else if (this.state.technology === 'Calabash') {
            test = {
                apkFile: this.state.apkSelected,
                queue: this.state.technology,
                packageName: this.state.packageName,
                projectId: this.state.appKey,
                versionKey: this.state.versionKey,
                file: this.state.fileName
            }
        }

        axios.post("http://localhost:3001/api/sendTest", test).then(response => {
            alert("The test was submitted succesfully!");
        }).catch(error => {
            console.log(error)
            alert("There was an error creating your test");
        });
    }

    render() {
        var packageAndroid
        //console.log(this.state.app)
        if (this.state.app && this.state.app.type.toLowerCase() === 'android') {
            packageAndroid = (
                <div className="form-group">
                    <label htmlFor="packageName">Package name</label>
                    <div className="input-group">
                        <input
                            type="text"
                            value={this.state.value}
                            onChange={this.handleChange}
                            className="form-control"
                            id="packageName"
                            required />
                        <div className="invalid-feedback">
                            Please provide a package name
                </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="container-fluid border border-primary">

                <h1>New test run</h1>
                <br /><br />
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <h4>Version to be tested</h4>
                        <select
                            multiple
                            onChange={this.onOptionChanged}
                            className="form-control">
                            {this.renderListApks()}
                        </select>
                    </div>
                    {packageAndroid}
                    <div className="input-group">
                        <label htmlFor="techonology">Technology</label>
                        <div className="input-group">
                            <select
                                id="techonology"
                                onChange={this.onTechnologyOptionChanged}
                                className="form-control">
                                {this.renderListTechnologies()}
                            </select>
                        </div>

                    </div>
                    <div className="form-group">
                        {this.renderTechnologySection()}
                    </div>
                    <div className="form-group">
                        {this.renderMessage()}
                    </div>

                </form>


            </div>
        )
    }
}
