import React, { Component } from 'react';
import { observer } from 'mobx-react';

import ObjectiveList from './ObjectiveList';
import ObjectiveStore from '../stores/ObjectiveStore';

import TaskList from './TaskList';
import TaskStore from '../stores/TaskStore';

import ObservationList from './ObservationList';
import ObservationStore from '../stores/ObservationStore';

import ConstraintList from './ConstraintList';
import ConstraintStore from '../stores/ConstraintStore';

import { Typography } from 'antd';

const { Title } = Typography;

@observer
export default class SharedCoachingPlan extends Component {
    
    constructor(props) {
        super(props);

        this.objectiveStore = new ObjectiveStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId });
        this.objectiveStore.fetchObjectives();

        this.taskStore = new TaskStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId, memberId: props.memberId });
        this.taskStore.fetchTasks();

        this.observationStore = new ObservationStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId });
        this.observationStore.fetchObservations();

        this.constraintStore = new ConstraintStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId });
        this.constraintStore.fetchOptions();
    }

    render() {

        const height = window.innerHeight*84/100;

        return (
            <div style={{marginLeft:10,marginRight:10 }}> 
                <Title style={{color:"white"}} level={4}>Plan</Title>
                <div style={{display:"flex",flexDirection:"column",height:height,overflow:"auto"}}>
                    <div style={{ display: "flex",flexDirection: "row", marginBottom:"10px"}}>
                        <TaskList key="onward" taskStore={this.taskStore} />
                        <ObjectiveList key="objectives" objectiveStore={this.objectiveStore} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "row"}}>
                        <ConstraintList key="options" constraintStore={this.constraintStore} />
                        <ObservationList key="observations" observationStore={this.observationStore} />
                    </div>
                </div>
          </div>
        )
    }
}
