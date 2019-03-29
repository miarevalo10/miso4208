import React, { Component } from 'react';
import axios from "axios";

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
        formData.append('file', this.state.file[0]);
        axios.post("http://localhost:3001/api/test-upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
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
                    <input label='upload file' type='file' onChange={this.handleFileUpload} />
                    <button className="btn btn-primary" type='submit'>Upload</button>
                    <br />
                    <h4>{this.renderMessage()}</h4>
                </form>
            </div>
        );
    }
}
