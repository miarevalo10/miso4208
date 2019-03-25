import React, { Component } from 'react';
import axios from "axios";

export default class Vrtscreen extends Component {



    sendMsg(msg) {
        axios.post("http://localhost:3001/api/sendvrt", {
            message: msg
        });
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
