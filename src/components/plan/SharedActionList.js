import React from 'react';
import { observer } from 'mobx-react';

import ActionList from './ActionList';
import TaskStore from '../stores/TaskStore';
import TaskDrawer from './TaskDrawer';

import {Button,Tooltip, Typography } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

const { Title } = Typography;

const titleBarStyle = { background: "rgb(59,109,171)", display: "flex", flexWrap: "wrap", minHeight: 50, height: 50, flexDirection: "row", justifyContent: "space-between", marginBottom: "5px" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold", color: "white" };

@observer
class SharedActionList extends ActionList {

    constructor(props) {
        super(props);

        this.store = new TaskStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId, memberId: props.memberId });
        this.store.isCoach = props.isCoach;

        this.store.fetchTasks();
    }

    refreshStores = () => {
        this.store.fetchTasks();   
    }

    getTitle = () => {
        return (
            <div style={titleStyle}>
                <Title style={{ color: "white" }} level={4}>Action Plan &nbsp; 
                <Tooltip key="refresh" title="Refresh for latest updates">
                    <Button key="refresh" icon={<SyncOutlined />} shape="circle" onClick={() => this.refreshStores()}></Button>
                </Tooltip>
                &nbsp;{this.countTag()}</Title>
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
        const rowCount = this.store.rowCount;
        
        // eslint-disable-next-line
        const change = this.store.change;

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
export default SharedActionList