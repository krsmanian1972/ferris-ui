import React, { Component } from 'react';
import EditableDescription from './EditableSessionDescription';
import {Typography } from 'antd';
const { Title } = Typography;

export default class GoldenTemplate extends Component {

    render() {
        return  (
            <div>
                <Title style={{marginTop:30}} level={4}>Plan</Title>
                
                <div style={{ display: "flex", flexDirection: "row",justifyContent:"space-between"}}>
                    <EditableDescription key="onward" type="action" title="Onward" fileName="onward.html" sessionUserId={this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                    <EditableDescription key="objective" type="action" title="Objective" fileName="objective.html" sessionUserId={this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                </div>

                <div style={{ display: "flex", flexDirection: "row",justifyContent:"space-between"}}>
                    <EditableDescription key="opportunities" title="Opportunities" fileName="options.html" sessionUserId={this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                    <EditableDescription key="observations" title="Observations" fileName="observations.html" sessionUserId={this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                </div>
                
            </div>
        )
    }
}
