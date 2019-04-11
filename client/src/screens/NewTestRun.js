import React, { Component } from 'react';
import axios from "axios";

export default class NewTestRun extends Component {

    constructor() {
        super();
        this.state = {
            apks: [],
            apkSelected: "",
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
                "Espresso"
            ],
            technology: "Monkey",
            packageName: "",
            events: 100,
            seed: 1234
        };
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
                    console.log(response.data.Contents);
                    this.setState({ apks: response.data.Contents });

                }
            });
    };

    onOptionChanged = (event) => {
        this.setState({
            apkSelected: event.target.value,
        });
    }

    onTechnologyOptionChanged = (event) => {
        this.setState({
            technology: event.target.value,
        });
    }

    renderListApks() {
        return this.state.apks.slice(1).map((apk) => {
            var list = apk.Key.split("/")
            var key = list[1];
            return <option key={key} value={key}>{key}</option>

        })
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
            default:
                return (<div>
                </div>);
        }
    }

    renderMessage() {
        if (this.state.apkSelected === "") {
            return <h5>Please select the file you want to test</h5>
        } else {
            return <button className="btn btn-primary" type="submit">I want to run {this.state.technology} testing
            on the {this.state.apkSelected} file.</button>

        }
    }

    handleChange = (event) => {
        this.setState({ packageName: event.target.value });
    }

    handleChangeEvents = (event) => {
        this.setState({ events: event.target.events });
    }

    handleChangeSeed = (event) => {
        this.setState({ seed: event.target.seed });
    }

    handleSubmit = (event) => {
        alert("The test was submitted succesfully!");
        event.preventDefault();
        if (this.state.apkSelected === "") {
            return;
        }
        console.log(this.state);

        axios.post("http://localhost:3001/api/sendTest", {
            apkName: this.state.apkSelected,
            queue: this.state.technology,
            packageName: this.state.packageName,
            events: this.state.events,
            seed: this.state.seed
        });
    }

    render() {
        return (
            <div className="container-fluid border border-primary">

                <h1>New test run</h1>
                <br /><br />
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <h4>Apk to be tested</h4>
                        <select
                            multiple
                            onChange={this.onOptionChanged}
                            className="form-control">
                            {this.renderListApks()}
                        </select>
                    </div>
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
