import React, { Component } from 'react';
import axios from "axios";

export default class Vrtscreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            file1:{},
            file2:{}
        }
    }

    changeFileOne(newFile) {
        this.setState({
            file1:newFile
        })
    }

    changeFileTwo(newFile) {
        this.setState({
            file2:newFile
        })
    }

    sendMsg() {
        axios.post("http://localhost:3001/api/sendvrt", {
            first_file:this.state.file1,
            second_file:this.state.file2
        });
        axios.post("http://localhost:3001/api/sendvrt")
    };

    render() {
        return (
            <div class="container">

            <h1>Visual Regression Testing</h1>

            <form>
            <div class="container">
            <div class="row">
                <div class="form-group col-6">
                    <label 
                    for="exampleFormControlFile1">Screenshots primera version</label>
                    <br/>
                    <input 
                    type="file" 
                    class="form-control-file" 
                    id="exampleFormControlFile1" />
                </div>
                <div class="form-group col-6">
                    <label 
                    for="exampleFormControlFile1">Screenshots segunda version</label>
                    <br/>
                    <input 
                    type="file" 
                    class="form-control-file" 
                    id="exampleFormControlFile1" />
                </div>
                </div>
            </div>
                <button 
                type="submit" 
                class="btn btn-primary"
                onClick={() => this.sendMsg()}>Submit</button>
            </form>
            </div>
        );

    }
}
