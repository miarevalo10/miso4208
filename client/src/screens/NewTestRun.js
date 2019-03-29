import React, { Component } from 'react';
import axios from "axios";
import FileUpload from './FileUpload';

export default class NewTestRun extends Component {

    constructor() {
        super();
        this.state = {
            apks:[],
            apkSelected: "",
            testsTypes: [
                "Monkey",
                "End2End",
                "Mutation",
                "Behaviour Driven",
                "Visual Regression"
            ],
            typeSelected:"Monkey",
            technologies:[
                "Calabash",
                "Cypress",
                "Espresso"
            ],
            technology:"Calabash"
        };
    }

    componentDidMount(){
        this.getAvailableApks();
    }

    getAvailableApks() {
        axios.get("http://localhost:3001/api/get-apks")
        .then((response,err) => {
            if(err) {
                console.log(err);
            } else {
                console.log(response.data.Contents);
                this.setState({apks: response.data.Contents});
                
            }
        });
    };

    onOptionChanged = (event) => {
        this.setState({
            apkSelected: event.target.value,
        });
    }

    onTypeOptionChanged = (event) => {
        this.setState({
            typeSelected: event.target.value,
        });
    }

    onTechnologyOptionChanged = (event) => {
        this.setState({
            technology: event.target.value,
        });
    }

    renderListApks() {
        return this.state.apks.map((apk)=>{
            return <option key={apk.Key} value={apk.Key}>{apk.Key}</option>
        })
    }

    renderListTesting() {
        return this.state.testsTypes.map((type)=>{
            return <option key={type} value={type}>{type}</option>
        })
    }

    renderListTechnologies() {
        return this.state.technologies.map((tech)=>{
            return <option key={tech} value={tech}>{tech}</option>
        })
    }

    renderTechnologySection(){
        if(this.state.typeSelected.localeCompare("Monkey")){
            return (<div>
                <h4>Technologie to use</h4>
                <select onChange={this.onTechnologyOptionChanged}>
                    {this.renderListTechnologies()}
                </select>
            </div>);
        }
    }

    renderMessage() {
        if(this.state.apkSelected === ""){
            return <h2>Please select the file you want to test</h2>
        } else {
            return <button className="btn btn-primary">I want to run {this.state.typeSelected} testing 
            on the {this.state.apkSelected} file.</button>
        }
    }

    sendMsg(msg){
        if(this.state.apkSelected===""){
            return ;
        }
        axios.post("http://localhost:3001/api/sendTest", {
            apkName:this.state.apkSelected,
          queue: this.state.typeSelected
        });
      };

    render() {
        console.log(this.state.apks);
        return (
            <div className="container">
            
                <h1>New test run</h1>
                <br/><br/>
                <h4>Apk to be tested</h4>
                <select onChange={this.onOptionChanged}>
                    {this.renderListApks()}
                </select>
                <br/>
                <br/>
                <h4>Testing to be made</h4>
                <select onChange={this.onTypeOptionChanged}>
                    {this.renderListTesting()}
                </select>
                <br/>
                <br/>
                {this.renderTechnologySection()}
                <br/>
                <br/>
            
               {this.renderMessage()}

               <br/>
                <br/>
                <hr/>

               <FileUpload title="Upload script if needed"/>
               <br/>
                <hr/>
               <FileUpload title="Upload apk if needed"/>
               
            </div>
        )
    }
}
