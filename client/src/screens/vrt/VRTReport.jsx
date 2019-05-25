import React, { Component } from 'react';
import axios from "axios";
import {
  ListGroup, ListGroupItem, Container,
  Badge, ListGroupItemHeading, ListGroupItemText,
  Collapse, Button, Card,
  Row,
} from 'reactstrap';
import _ from 'lodash';
import { Link } from "react-router-dom";


export default class VRTReport extends Component {

  constructor(props) {
    super(props);
    this.state = {
      process: this.props.location.state.process,
      data: [],
      expandedRows: []
    }
    console.log('process', this.state.process);
  }

  componentDidMount() {
    this.getReport();
  }

  getReport = () => {
    const { report } = this.state.process;
    axios.get(report).then((res) => {
      console.log("res", res.data);
      this.setState({ data: res.data });
    });
  }

  handleRowClick(rowId) {
    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    const newExpandedRows = isRowCurrentlyExpanded ?
      currentExpandedRows.filter(id => id !== rowId) :
      currentExpandedRows.concat(rowId);

    this.setState({ expandedRows: newExpandedRows });
  }


  renderFeature(feature) {
    const {scenarios} = feature;
    const clickCallback = () => this.handleRowClick(feature.name);
    const featName = feature.name.split('.feature')[0];
    const featureItem = [
      // <ListGroupItem className="item" onClick={clickCallback} key={feature.name}>{feature.name}</ListGroupItem>
    ];
    
    if (this.state.expandedRows.includes(feature.name)) {
      featureItem.push(<p className="scenarioTitle">Scenarios</p>);
      scenarios.forEach( scenario => {
        featureItem.push(
          <ListGroupItem className="scenario" key={scenario.name}>
            <Link to={{
            pathname: '/vrt-scenario',
            state: {
               scenario: scenario
            }
        }}>
            {scenario.name}
            </Link>
            </ListGroupItem>
        );
      });

    }
    return <Card className="featureCard" onClick={clickCallback} key={feature.name} ><p className="featureTitle">{featName}</p><ListGroup>{featureItem}</ListGroup></Card>;

  }

  render() {
    let allItemRows = [];

    this.state.data.forEach(feature => {
      const perItemRows = this.renderFeature(feature);
      allItemRows = allItemRows.concat(perItemRows);
    });

    return (

      <Container>
        <h2>VRT Report</h2>
        <br />
        <br />
        <h3>Features</h3>
        <br/>
        {allItemRows}

      </Container>
    );
  }
}