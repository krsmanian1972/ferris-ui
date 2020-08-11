import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import EditableDescription from './EditableSessionDescription';
import ObjectiveList from './ObjectiveList';
import ObjectiveStore from '../stores/ObjectiveStore';

import {Typography } from 'antd';

const { Title } = Typography;

@inject("appStore")
@observer
export default class GoldenTemplate extends Component {
    constructor(props) {
        super(props);
        this.objectiveStore = new ObjectiveStore({apiProxy: props.appStore.apiProxy,enrollmentId:props.enrollmentId});
        this.objectiveStore.fetchObjectives();
    }

    render() {
        return  (
            <div>
                <Title style={{marginTop:30}} level={4}>Plan</Title>
                
                <div style={{ display: "flex", flexDirection: "row",justifyContent:"space-between"}}>
                    <EditableDescription key="onward" type="action" title="Onward" fileName="onward.html" sessionUserId={this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                    <ObjectiveList key="objectives" objectiveStore = {this.objectiveStore} />
                </div>

                <div style={{ display: "flex", flexDirection: "row",justifyContent:"space-between"}}>
                    <EditableDescription key="opportunities" title="Opportunities" fileName="options.html" sessionUserId={this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                    <EditableDescription key="observations" title="Observations" fileName="observations.html" sessionUserId={this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                </div>
                
            </div>
        )
    }
}
