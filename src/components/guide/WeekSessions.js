import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { PageHeader,Button } from 'antd';

import { pageHeaderStyle,pageTitle } from '../util/Style';

import SessionGrid from '../flow/SessionGrid';

const containerStyle = {
    height: window.innerHeight * .79,
    width: window.innerWidth,
};

const graphPaperStyle = {
    border: "1px solid black",
    borderRadius: "12px",
    maxHeight: window.innerHeight * .80,
    overflowY: "auto"
}

@observer
class WeekSessions extends Component {

    constructor(props) {
        super(props);
    }


    componentDidMount() {
        this.sessionGrid = new SessionGrid(this.container,this.requestData);
        window.addEventListener("resize", this.sessionGrid.handleWindowResize);
    }

    requestData= () => {
        this.sessionGrid.updateEventMatrix();
    }

    changeDates = () => {
        this.sessionGrid.updateEventMatrix();
    }

    testButton = () => {
        return (
            <Button type="primary" onClick={this.changeDates}>Test</Button>
        )
    }

    render() {
        return (
            <PageHeader 
                style={pageHeaderStyle} 
                title={pageTitle("Weekly Schedule")}
                extra={[
                    this.testButton()
                ]}>
                <div key="graphPaper" style={graphPaperStyle}>
                    <div key="container" style={containerStyle} id="container" ref={ref => (this.container = ref)} />
                </div>
            </PageHeader>
        )
    }
}
export default WeekSessions