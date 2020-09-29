import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Row, Col, Typography, Tooltip, Space } from 'antd';
import { ScissorOutlined, CloseOutlined, AimOutlined, PlusOutlined } from '@ant-design/icons';

import FlowComposer from '../flow/FlowComposer';
import PlanStore from '../stores/PlanStore';

const { Title } = Typography;

const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
};

const graphPaperStyle = {
    border: "1px solid black",
    borderRadius: "12px",
    maxHeight: window.innerHeight * .81,
    overflowY: "auto"
}

@inject("appStore")
@observer
class MasterPlanUI extends Component {

    constructor(props) {
        super(props);
        this.plan = props.params.plan;

        this.planStore = new PlanStore({
            apiProxy: props.appStore.apiProxy,
            planListStore: null
        })
    }

    componentDidMount() {
        this.composer = new FlowComposer(this.container);

        const task1 = { id: 2, name: 'Work on it now', roleId: "Coach", duration: 2, min: 1, max: 2, coordinates: { x: 1, y: 1, z: 0 }, shape: '' };
        const task2 = { id: 3, name: 'Work on it later', roleId: "Member", duration: 2, min: 1, max: 2, coordinates: { x: 1, y: 3, z: 0 }, shape: '' };

        const tasks = [];
        tasks.push(task1);
        tasks.push(task2);

        this.composer.populateTasks(tasks);
        //this.composer.populateLinks();
    }


    deleteSelectedLine = () => {
        if (this.composer) {
            this.composer.deleteSelectedLine();
        }
    }

    deleteSelectedTask = () => {
        if (this.composer) {
            this.composer.deleteSelectedTask();
        }
    }

    validatePlan = () => {

    }

    savePlan = () => {
        const taskPositions = this.composer.getTaskPositions();
        this.planStore.saveMasterPlan(this.plan.id,taskPositions);
    }


    renderControls = () => {
        return (
            <Row style={{marginBottom:5, paddingBottom:0, paddingTop:0}}>
                <Col span={1}/>
                <Col span={17}>
                    <Title level={4}>{this.plan.name}</Title>
                </Col>
                <Col span={2}>
                    <Space>
                        <Tooltip title="Save The Plan">
                            <Button key="savePlan" onClick={this.savePlan} type="primary">Save</Button>
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={2}>
                    <Space>
                        <Tooltip title="Define A New Task">
                            <Button key="defineTask" onClick={this.defineTask} style={{ border: "1px solid green", color: "green" }} icon={<AimOutlined />} shape={"circle"} />
                        </Tooltip>
                        <Tooltip title="Pull Tasks">
                            <Button key="pullTasks" onClick={this.pullTasks} style={{ border: "1px solid green", color: "green" }} icon={<PlusOutlined />} shape={"circle"} />
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={2}>
                    <Space>
                        <Tooltip title="Delete Selected Link">
                            <Button key="delLine" danger onClick={this.deleteSelectedLine} type="primary" icon={<ScissorOutlined />} shape={"circle"} />
                        </Tooltip>
                        <Tooltip title="Delete Selected Task">
                            <Button key="delTask" danger onClick={this.deleteSelectedTask} type="primary" icon={<CloseOutlined />} shape={"circle"} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
        )
    }


    render() {
        return (
            <div>
                {this.renderControls()}
                <div key="graphPaper" style={graphPaperStyle}>
                    <div key="container" style={containerStyle} id="container" ref={ref => (this.container = ref)} />
                </div>
            </div>
        )
    }
}

export default MasterPlanUI;