import React, { Component } from 'react';
import {
    UncontrolledCarousel,
    Container
} from 'reactstrap';
import axios from "axios";
import './style.css';


class ReportDetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appKey: this.props.location.state.appKey,
            processKey: this.props.location.state.processKey,
            process: this.props.location.state.process,
            items: []
        }

        console.log(this.state)
    }

    componentDidMount() {
        this.getScreenshots()
    }

    getScreenshots = () => {
        console.log("get applications")
        axios.get("http://localhost:3001/api/get-screenshots", {
            params: {
                projectId: this.state.appKey,
                processId: this.state.processKey,
                appTechnology: this.state.process.type,
            }
        }).then((res) => {
            console.log("res", res.data.Contents);
            const imgs = res.data.Contents;
            var imagesToState = [];
            imgs.map((elem) => {
                console.log(elem)
                var toAdd = {
                    src: "https://s3-us-west-2.amazonaws.com/pruebas-autom/" + elem.Key,
                    caption: elem.Key,
                    altText: elem.Key,
                }
                imagesToState.push(toAdd);
                return toAdd
            })
            this.setState({ items: imagesToState });
            return imagesToState
        });
    }

    renderHTMLReport = () => {
        const { report } = this.state.process;
        if (report) {
            return <div>
                <h3>Report</h3>
                <br/>
                <iframe
                title="Report"
                src={report}
            />
                </div>
        }
    }

    renderCarrousel = () => {
        const { items } = this.state;
        if (items.length !== 0) {
            return <div>
            <h3>Screenshots</h3>
            <br/>
            <UncontrolledCarousel items={this.state.items} />
            </div>
        }
    }

    renderTitle = () => {
        const { process } = this.state;
        var events
        if (process.events) {
            events = <span>       # of events: {process.events} - </span>
        }
        var seed
        if (process.seed) {
            seed = <span>Seed: {process.seed} - </span>
        }
        var state
        if (process.state) {
            state = <span>State: {process.state} </span>
        }

        return <div>{events}{seed}{state}</div>
    }


    render() {
        console.log(this.state)
        return (
            <Container>
                        {this.renderTitle()}
                        {this.renderHTMLReport()}
                        {this.renderCarrousel()}
               <br/>
               <br/>
            </Container>
        );
    }
}


export default ReportDetail;
