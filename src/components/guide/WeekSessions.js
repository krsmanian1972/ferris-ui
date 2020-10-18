import React, { Component } from 'react';
import { observer,inject } from 'mobx-react';
import moment from 'moment';

import { PageHeader,Button } from 'antd';

import { pageHeaderStyle,pageTitle } from '../util/Style';

import SessionGrid from '../flow/SessionGrid';

import SessionListStore from '../stores/SessionListStore';

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

@inject("appStore")
@observer
class WeekSessions extends Component {

    constructor(props) {
        super(props);
        this.store = new SessionListStore({ apiProxy: props.appStore.apiProxy });
        this.refDate = null;
        this.visibleDate = null;
        this.refTime = null;
        this.currentDisplayTime = null;

    }


    componentDidMount() {
        this.sessionGrid = new SessionGrid(this.container,this.requestData);
        window.addEventListener("resize", this.sessionGrid.handleWindowResize);
    }

    requestData= () => {
        this.sessionGrid.updateEventMatrix();
    }

    changeDates = async() => {

        this.refDate = moment("2020-10-16","YYYY-MM-DD");
        this.currentDisplayDate = moment(this.refDate);

        this.refTime = moment().subtract(3,'hours');
        this.currentDisplayTime = moment(this.refTime);

        this.sessionData = await this.store.buildWeeklyRoster(this.refDate);
        this.sessionGrid.updateEventMatrixWithDate(this.sessionData, this.refDate, this.refTime);

    }

    incrementTime = () => {
      this.currentDisplayTime = moment(this.currentDisplayTime).add(1,'hours');
      this.sessionGrid.updateEventMatrixWithDate(this.sessionData, this.currentDisplayDate, this.currentDisplayTime);
    }

    decrementTime = () => {
      this.currentDisplayTime = moment(this.currentDisplayTime).subtract(1,'hours');
      this.sessionGrid.updateEventMatrixWithDate(this.sessionData, this.currentDisplayDate, this.currentDisplayTime);
    }

    increaseDate = async() =>{
        this.currentDisplayDate = moment(this.currentDisplayDate).add(1,'days');
        this.sessionData = await this.store.buildWeeklyRoster(this.currentDisplayDate);
        this.sessionGrid.updateEventMatrixWithDate(this.sessionData, this.currentDisplayDate, this.currentDisplayTime);

    }

    decreaseDate = async() =>{
        this.currentDisplayDate = moment(this.currentDisplayDate).subtract(1,'days');
        this.sessionData = await this.store.buildWeeklyRoster(this.currentDisplayDate);
        this.sessionGrid.updateEventMatrixWithDate(this.sessionData, this.currentDisplayDate, this.currentDisplayTime);

    }

    testButton = () => {
        return (
            <>
            <Button type="primary" onClick={this.changeDates}>Test</Button>
            <Button type="primary" onClick={this.incrementTime}>Time Up</Button>
            <Button type="primary" onClick={this.decrementTime}>Time Down</Button>
            <Button type="primary" onClick={this.increaseDate}>Next Day</Button>
            <Button type="primary" onClick={this.decreaseDate}>Prev Day</Button>
            </>
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
