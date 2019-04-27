import React, { Component } from 'react';
import axios from "axios";
import {
    Col, Row
} from 'reactstrap';
export default class FileUpload extends Component {

    constructor(props) {
        super(props);
        this.state = {
            file: null,
            success: false,
            message: "",
            title: props.title || "Upload file"
        };
    }

    submitFile = (event) => {
        event.preventDefault();
        const formData = new FormData();
        //                'Content-Type': 'multipart/form-data'

        formData.append('file', this.state.file[0]);
        axios.post("http://localhost:3001/api/apk-upload", formData, {
            headers: {
                'Content-Type': 'application/apk'
            }
        }).then(response => {
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
    }

    renderMessage() {
        if (this.state.success) {
            return <div>{this.state.message}</div>;
        } else {
            return <div></div>;
        }
    }

    render() {
        return (
            <div>
                <h4>{this.state.title}</h4>
                <form onSubmit={this.submitFile}>
                <Row>
                    <Col md={8}>
                        <input label='upload file' type='file' onChange={this.handleFileUpload} />
                    </Col>
                    <Col md={4}>
                        <button className="btn btn-primary" type='submit'>Upload</button>
                    </Col>
                    </Row>                   
                    
                    <h4>{this.renderMessage()}</h4>
                </form>
            </div>
        );
    }
}
