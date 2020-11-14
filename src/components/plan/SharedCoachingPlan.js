import React, { Component } from 'react';
import { observer } from 'mobx-react';

import ObjectiveList from './ObjectiveList';
import ObjectiveStore from '../stores/ObjectiveStore';

import ObservationList from './ObservationList';
import ObservationStore from '../stores/ObservationStore';

import ConstraintList from './ConstraintList';
import ConstraintStore from '../stores/ConstraintStore';

import { Typography } from 'antd';

const { Title } = Typography;

const titleBarStyle = { background: "rgb(59,109,171)", display: "flex", flexWrap: "wrap", minHeight: 50, height: 50, flexDirection: "row", justifyContent: "space-between", marginBottom: "5px" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold", color: "white" };

@observer
export default class SharedCoachingPlan extends Component {

    constructor(props) {
        super(props);

        this.objectiveStore = new ObjectiveStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId });
        this.objectiveStore.isCoach = props.isCoach;
        this.objectiveStore.fetchObjectives();

        this.observationStore = new ObservationStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId });
        this.observationStore.isCoach = props.isCoach;
        this.observationStore.fetchObservations();

        this.constraintStore = new ConstraintStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId });
        this.constraintStore.isCoach = props.isCoach;
        this.constraintStore.fetchOptions();
    }

    renderTitle = () => {
        return (
            <div style={titleBarStyle}>
                <div style={titleStyle}>
                    <Title style={{ color: "white" }} level={4}>Coaching Plan</Title>
                </div>
            </div>
        )
    }

    render() {

        const height = window.innerHeight * 84 / 100;
        const contentStyle = { margin: "1%",display: "flex", flexDirection: "column", height: height, overflow: "auto" };

        return (
            <div>
                {this.renderTitle()}
                <div style={contentStyle}>
                    <ObjectiveList key="objectives" objectiveStore={this.objectiveStore} />
                    <ObservationList key="observations" observationStore={this.observationStore} />
                    <ConstraintList key="options" constraintStore={this.constraintStore} />
                </div>
            </div>
        )
    }
}
