import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

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

@inject("appStore")
@observer
export default class GoldenTemplate extends Component {
    constructor(props) {
        super(props);

        this.objectiveStore = new ObjectiveStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.objectiveStore.fetchObjectives();

        this.taskStore = new TaskStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId, memberId: props.memberId });
        this.taskStore.fetchTasks();

        this.observationStore = new ObservationStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.observationStore.fetchObservations();

        this.constraintStore = new ConstraintStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.constraintStore.fetchOptions();
    }

    render() {
        return (
            <div>
                <Title style={{ marginTop: 30 }} level={4}>Plan</Title>

                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <TaskList key="onward" taskStore={this.taskStore} />
                    <ObjectiveList key="objectives" objectiveStore={this.objectiveStore} />
                </div>

                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <ConstraintList key="options" constraintStore={this.constraintStore} />
                    <ObservationList key="observations" observationStore={this.observationStore} />
                </div>

            </div>
        )
    }
}
