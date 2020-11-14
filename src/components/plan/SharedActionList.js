import React from 'react';
import { observer } from 'mobx-react';

import ActionList from './ActionList';
import TaskStore from '../stores/TaskStore';
import TaskDrawer from './TaskDrawer';

import { Typography } from 'antd';
const { Title } = Typography;

const titleBarStyle = { background: "rgb(59,109,171)", display: "flex", flexWrap: "wrap", minHeight: 50, height: 50, flexDirection: "row", justifyContent: "space-between", marginBottom: "5px" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold", color: "white" };

@observer
export default class SharedActionList extends ActionList {

    constructor(props) {
        super(props);

        this.store = new TaskStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId, memberId: props.memberId });
        this.store.isCoach = props.isCoach;

        this.store.fetchTasks();
    }

    getTitle = () => {
        return (
            <div style={titleStyle}>
                <Title style={{ color: "white" }} level={4}>Action Plan &nbsp;{this.countTag()}</Title>
            </div>
        )
    }

    renderTitle = () => {
        return (
            <div style={titleBarStyle}>
                {this.getTitle()}
                {this.getControls()}
            </div>
        )
    }


    render() {
        const height = window.innerHeight * 83 / 100;

        const contentStyle = { margin: "1%", padding: "1%", display: "flex", flexDirection: "column", height: height, overflow: "auto", background: "white" };

        const tasks = this.store.tasks;
        const change = this.store.change;
        const rowCount = this.store.rowCount;

        return (
            <div>
                {this.renderTitle()}
                <div style={contentStyle}>
                    {this.renderSlider(tasks, rowCount)}
                    {this.displayMessage()}
                </div>
                <TaskDrawer taskStore={this.store} />
            </div>
        )
    }
}
