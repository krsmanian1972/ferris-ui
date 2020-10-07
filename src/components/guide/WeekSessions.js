import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Result, Spin,Typography,Button } from 'antd';
import SessionGrid from '../flow/SessionGrid';

const { Title } = Typography;

const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
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
        this.sessionGrid = new SessionGrid(this.container);
    }

    changeDates = () => {
        this.sessionGrid.changeDates();
    }

    testButton = () => {
        return (
            <Button type="primary" onClick={this.changeDates}>Test</Button>
        )
    }

    render() {
        return (
            <div>
                {this.testButton()}
                <div key="graphPaper" style={graphPaperStyle}>
                    <div key="container" style={containerStyle} id="container" ref={ref => (this.container = ref)} />
                </div>
            </div>
        )
    }
}
export default WeekSessions