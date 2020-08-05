import React, { Component } from 'react';
import EditableDescription from './EditableSessionDescription';
import {Typography } from 'antd';
const { Title } = Typography;

export default class GoldenTemplate extends Component {

    render() {
        return  (
            <>
                <Title style={{marginTop:30}} level={4}>Coaching Plan</Title>
                <div style={{ display: "flex", marginTop:10, flexDirection: "column"}}>
                    <div style={{ display: "flex", flexDirection: "row"}}>
                        <EditableDescription key="onward" title="Onward" fileName="future.html" sessionUserFuzzyId={this.props.sessionUserFuzzyId} apiProxy={this.props.apiProxy}/>
                        <EditableDescription key="objectives" title="Objectives" fileName="goal.html" sessionUserFuzzyId={this.props.sessionUserFuzzyId} apiProxy={this.props.apiProxy}/>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row"}}>
                        <EditableDescription key="opportunities" title="Opportunities" fileName="options.html" sessionUserFuzzyId={this.props.sessionUserFuzzyId} apiProxy={this.props.apiProxy}/>
                        <EditableDescription key="observations" title="Observations" fileName="observations.html" sessionUserFuzzyId={this.props.sessionUserFuzzyId} apiProxy={this.props.apiProxy}/>
                    </div>
                </div>
            </>
        )
    }
}
