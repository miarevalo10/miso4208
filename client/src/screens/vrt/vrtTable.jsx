import React, { Component } from 'react';
import axios from "axios";
import {
  Container, Table, Card,
} from 'reactstrap';

const bucketUrl = 'https://s3-us-west-2.amazonaws.com/pruebas-autom/';

export default class VRTTable extends Component {


  constructor(props) {
    super(props);
    this.state = {
      scenario: this.props.location.state.scenario,
      data: this.props.location.state.scenario.screenshots,
      expandedRows: []
    }
    console.log('this.state', this.state.scenario);
  }

  handleRowClick(rowId) {
    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    const newExpandedRows = isRowCurrentlyExpanded ?
      currentExpandedRows.filter(id => id !== rowId) :
      currentExpandedRows.concat(rowId);

    this.setState({ expandedRows: newExpandedRows });
  }


  renderScreenshot(step) {
    const sName = step.name.split('.png')[0];
    const eName = sName.split('_').join(' ');

    var stepScreenshot = '';

    const row = <tr key={step.name}>
      <td><img className="stepImg" alt="v1" src={bucketUrl + step.v1}></img></td>
      <td><img className="stepImg" alt="v2" src={bucketUrl + step.v2}></img></td>
      <td><img className="stepImg" alt="diff" src={bucketUrl + step.diff}></img></td>
    </tr>

    stepScreenshot = <Table>
      <thead>
        <tr>
          {/* <th>Step name</th> */}
          <th>Version one</th>
          <th>Version two</th>
          <th>Diff</th>
        </tr>
      </thead>
      <tbody>
        {row}
      </tbody>
    </Table>

    return <Card className="featureCard" key={step.name} ><p className="featureTitle">{eName}</p>{stepScreenshot}</Card>;
  }

  renderStep(step) {
    const sName = step.name.split('.png')[0];

    const row = <tr key={step.name}>
      {/* <td>{sName}</td> */}
      <td>{sName}</td>
      <td></td>
      <td></td>
    </tr>
    return row;
  }

  render() {
    const { screenshots, name } = this.state.scenario;
    let allItemRows = [];

    screenshots.forEach(step => {
      //const perItemRows = this.renderStep(step);
      const ss = this.renderScreenshot(step);
      allItemRows = allItemRows.concat(ss);
    });
    return (
      <Container>
        <br />
        <h2>Scenario : {name}</h2>
        <br />
        {allItemRows}
      </Container>
    );
  }
}