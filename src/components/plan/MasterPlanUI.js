import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Row, Col, Typography, Tooltip, Space } from 'antd';
import { ScissorOutlined, CloseOutlined, AimOutlined, PlusOutlined } from '@ant-design/icons';

import FlowComposer from '../flow/FlowComposer';
import PlanStore from '../stores/PlanStore';

const { Title } = Typography;

const containerStyle = {
    height: window.innerHeight * 0.81,
    width: window.innerWidth
};

const graphPaperStyle = {
    border: "1px solid black",
    borderRadius: "12px",
    maxHeight: window.innerHeight * 0.81,
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
        this.buildTaskGraph();
    }

    buildTaskGraph = () => {

        this.composer = new FlowComposer(this.container);

        const task0 = { id: 0, name: 'Start', roleId: "", demand: 0, min: 0, max: 0, coordinates: '{ "x": 0, "y": 3.5, "z": 0 }', taskType: 'START_STOP_BOX' };
        const task1 = { id: 1, name: 'Dough', roleId: "Gopal", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": 2, "z": 0 }', taskType: '' };
        const task2 = { id: 2, name: 'Pooranam', roleId: "Raja", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": 0.5, "z": 0 }', taskType: '' };
        const task3 = { id: 3, name: 'Modhakam', roleId: "Guruji", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": -1.0, "z": 0 }', taskType: '' };
        const task4 = { id: 4, name: 'Dispatch', roleId: "Harini", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": -2.5, "z": 0 }', taskType: '' };
        const task5 = { id: 5, name: 'End', roleId: "", demand: 0, min: 0, max: 0, coordinates: '{ "x": 0, "y": -4, "z": 0 }', taskType: 'START_STOP_BOX' };

        const tasks = [task0, task1, task2, task3, task4, task5];

        this.composer.populateTasks(tasks);

        this.composer.linkBottomTop(0, 1);
        this.composer.linkBottomTop(1, 2);
        this.composer.linkBottomTop(2, 3);
        this.composer.linkBottomTop(3, 4);
        this.composer.linkBottomTop(4, 5);
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
                <Col span={18}>
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