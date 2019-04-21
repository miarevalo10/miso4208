import React, { Component } from 'react';
import NewTestRun from './NewTestRun';
import WebTestRun from './WebTestRun';
import FileUpload from './FileUpload';
import ScriptUpload from './ScriptUpload';
import axios from "axios";


export default class Home extends Component {

    constructor(props){
        super(props);
        this.state = {
            applications:[],
        }
    }

    componentDidMount() {
        console.log("componbent mounted");
        this.getApplicationsFromDB();
    }
    
    getApplicationsFromDB = () => {
        console.log("get applications")
        axios.get("http://localhost:3001/applications").then((res)=>{
            console.log("res", res);
            //this.setState({applications: res.data});
        });
    }

    renderApplications = () => {        
        console.log('state', this.state)
         this.state.applications.map((app)=>{
             console.log(app)
            return (<li key = {app.applicationDescription}>{app.applicationName}</li>);
        });
    }

    render() {
        return (
            <div className="App">
            <ul>
                {this.renderApplications()}
            </ul>
            </div>
        );

    }
}
