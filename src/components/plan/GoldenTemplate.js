import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import ObjectiveList from './ObjectiveList';
import ObjectiveStore from '../stores/ObjectiveStore';

import ActionList from './ActionList';
import TaskStore from '../stores/TaskStore';

import ObservationList from './ObservationList';
import ObservationStore from '../stores/ObservationStore';

import ConstraintList from '../guide/ConstraintList';
import ConstraintStore from '../stores/ConstraintStore';

import { Typography,Card } from 'antd';
import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;

const rightContentStyle = {background:"rgb(242,242,242)", width: "50%"};
const leftContentStyle = {background:"rgb(242,242,242)", width: "50%", marginRight:"10px" };

@inject("appStore")
@observer
export default class GoldenTemplate extends Component {
    constructor(props) {
        super(props);

        this.objectiveStore = new ObjectiveStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.objectiveStore.isCoach = props.isCoach;
        this.objectiveStore.fetchObjectives();

        this.taskStore = new TaskStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId, memberId: props.memberId });
        this.taskStore.isCoach = props.isCoach;
        this.taskStore.fetchTasks();

        this.observationStore = new ObservationStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.observationStore.isCoach = props.isCoach;
        this.observationStore.fetchObservations();

        this.constraintStore = new ConstraintStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.constraintStore.isCoach = props.isCoach;
        this.constraintStore.fetchOptions();
    }

    render() {

        return (
            <Card 
                headStyle = {cardHeaderStyle}
                style={{ borderRadius: "12px"}} 
                title={<Title level={4}>Plan</Title>}>

                <div style={{ display: "flex",flexDirection: "row", marginBottom:"10px"}}>
                    <ActionList key="onward" taskStore={this.taskStore} contentStyle={leftContentStyle}/>
                    <ObjectiveList key="objectives" objectiveStore={this.objectiveStore} contentStyle={rightContentStyle} />
                </div>

                <div style={{ display: "flex", flexDirection: "row"}}>
                    <ConstraintList key="options" constraintStore={this.constraintStore} contentStyle={leftContentStyle}/>
                    <ObservationList key="observations" observationStore={this.observationStore} contentStyle={rightContentStyle}/>
                </div>

            </Card>
        )
    }
}
