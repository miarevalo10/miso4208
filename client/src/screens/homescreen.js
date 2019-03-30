import React, { Component } from 'react';
import NewTestRun from './NewTestRun';
import WebTestRun from './WebTestRun';

export default class Home extends Component {

    render() {
        return (
            <div className="App">
                <WebTestRun/>
            </div>
        );

    }
}
