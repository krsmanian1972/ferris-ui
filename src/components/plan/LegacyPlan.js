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

import { Typography, Card, Space } from 'antd';
import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;

@inject("appStore")
@observer
export default class LegacyPlan extends Component {
    constructor(props) {
        super(props);

        this.objectiveStore = new ObjectiveStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.objectiveStore.fetchObjectives();

        this.taskStore = new TaskStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId, memberId: props.memberId });
        this.taskStore.fetchTasks();

        this.constraintStore = new ConstraintStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.constraintStore.fetchOptions();

        this.observationStore = new ObservationStore({ apiProxy: props.appStore.apiProxy, enrollmentId: props.enrollmentId });
        this.observationStore.fetchObservations();
    }

    render() {
        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px" }}
                title={<Title level={4}>Plan</Title>}>
                <ObjectiveList key="objectives" objectiveStore={this.objectiveStore} />
                <ObservationList key="observations" observationStore={this.observationStore} />
                <ConstraintList key="options" constraintStore={this.constraintStore} />
                <TaskList key="onward" taskStore={this.taskStore} />
            </Card>
        )
    }
}
