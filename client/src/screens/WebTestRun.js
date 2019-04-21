import React, { Component } from 'react';
import axios from "axios";

export default class WebTestRun extends Component {

    constructor() {
        super();
        this.state = {
            script: "",
            technology: "Gremlins",
            technologies: [
                "Gremlins",
                "Cypress"
            ],
            scripts: []
        }
    }

    componentDidMount() {
        this.getAvailableScripts(this.state.technology);
    }

    getAvailableScripts(scriptType) {
        if (scriptType.localeCompare("Gremlins")) {

            axios.get("http://localhost:3001/api/get-script-cypress")
                .then((response, err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response.data.Contents);
                        this.setState({ scripts: response.data.Contents });

                    }
                });
        } else {
            /*
            axios.get("http://localhost:3001/api/get-script-gremlins")
                .then((response, err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response.data.Contents);
                        this.setState({ scripts: response.data.Contents });

                    }
                });
                */
        }

    };

    renderListTechnologies() {
        return this.state.technologies.map((tech) => {
            return <option key={tech} value={tech}>{tech}</option>
        })
    }

    renderListScripts() {
        return this.state.scripts.slice(1).map((script) => {
            var list = script.Key.split("/")
            var key = list[1];
            return <option key={key} value={key}>{key}</option>

        })
    }

    onOptionChanged = (event) => {
        if (event.target.value.localeCompare(this.state.technology)) {
            this.setState({ scripts: [] });
            this.getAvailableScripts(event.target.value)
        }
        this.setState({
            technology: event.target.value,
        });
    }

    onScriptOptionChanged = (event) => {
        this.setState({
            script: event.target.value,
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.state.script === "") {
            return;
        }
        console.log(this.state);

        axios.post("http://localhost:3001/api/sendTest", {
            script: this.state.script,
            queue: this.state.technology
        });
        alert("The test was submitted succesfully!");
    }

    renderDetails() {
        switch (this.state.technology) {
            case "Gremlins":
                return (<h4>Unleash them!!</h4>);
            case "Cypress":
                return (<div className="form-group">
                    <h4>Script to use</h4>
                    <select
                        required
                        multiple
                        onChange={this.onScriptOptionChanged}
                        className="form-control">
                        {this.renderListScripts()}
                    </select>
                </div>);
            default:
                return (<div>Technology not recognized</div>);
        }
    }


    render() {
        return (
            <div className="container-fluid border border-primary">
                <h1>New web test run</h1>
                <br /><br />
                <form onSubmit={this.handleSubmit}>

                    <div className="form-group">
                        <h4>Technology</h4>
                        <select
                            onChange={this.onOptionChanged}
                            className="form-control">
                            {this.renderListTechnologies()}
                        </select>
                    </div>
                    {this.renderDetails()}
                    <button className="btn btn-primary" type="submit">
                        Run {this.state.technology}
                    </button>
                </form>
                <br/>
            </div>
        )
    }
}
