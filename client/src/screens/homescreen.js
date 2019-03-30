import React, { Component } from 'react';
import NewTestRun from './NewTestRun';
import WebTestRun from './WebTestRun';
import FileUpload from './FileUpload';
import ScriptUpload from './ScriptUpload';

export default class Home extends Component {

    render() {
        return (
            <div className="App">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-lg-6">
                            <NewTestRun />
                        </div>
                        <div className="col-12 col-lg-6">
                            <WebTestRun />
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-6">
                            <ScriptUpload title="Upload script if needed" />
                        </div>
                        <div className="col-12 col-msm-6">
                            <FileUpload title="Upload apk if needed" />
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}
