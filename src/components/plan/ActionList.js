import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Card, Typography, Spin, Result, Carousel, Button, Tooltip, Tag, Space, Statistic } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined, ReconciliationOutlined } from '@ant-design/icons';

import { cardHeaderStyle } from '../util/Style';

import Reader from "../commons/Reader";

import TaskStore from '../stores/TaskStore';
import TaskDrawer from './TaskDrawer';

import ActionStat from './ActionStat';

import ActionResponse from './ActionResponse';
import ActionResponseDrawer from './ActionResponseDrawer';

import ActionClosure from './ActionClosure';
import ActionClosureDrawer from './ActionClosureDrawer';

import ActionSummary from './ActionSummary';

const { Title } = Typography;

const taskTitleStyle = { color: "rgb(59,109,171)", textAlign: "center" };
const taskStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const sliderStyle = { display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" };

const activityBarStyle = { background: "rgb(36,39,84)", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" };
const activityTitleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold", color: "white" };
const valueStyle = { fontSize: "12px", fontWeight: "bold", color: "white", paddingRight: 10 };
const labelStyle = { fontSize: "10px", color: "white", textAlign: "right", paddingRight: 10 };

@observer
class ActionList extends Component {

    index = 0;

    constructor(props) {
        super(props);

        this.store = new TaskStore({ apiProxy: props.apiProxy, enrollmentId: props.enrollmentId, memberId: props.memberId });
        this.store.isCoach = props.isCoach;

        this.store.fetchTasks();
    }

    displayMessage = () => {

        if (this.store.isLoading) {
            return (
                <div key="loading" className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.store.isError) {
            return (
                <Result status="warning" title={this.store.message.help} />
            )
        }

        return (<></>)
    }


    renderSuggestedActivity = (task) => {
        const dueDate = task.scheduleEnd.format("DD-MMM-YYYY");
        const title = <Title level={5} style={labelStyle}>Due on</Title>

        return (
            <>
                <div style={activityBarStyle}>
                    <div style={activityTitleStyle}>Suggested Activity</div>
                    <Statistic title={title} value={dueDate} valueStyle={valueStyle} />
                </div>

                <div style={taskStyle}>
                    <Reader value={task.description} readOnly={true} height={350} />
                </div>
            </>
        )
    }

    geEditButton = (task) => {
        if (this.store.isCoach && !task.respondedDate) {
            return (
                <Tooltip key="ed_act_tip" title="To edit this activity">
                    <Button key="edit_task" icon={<EditOutlined />} shape="circle" onClick={() => this.showEditTask()}></Button>
                </Tooltip>
            )
        }
    }

    renderTask = (task, index) => {
        const key = `action_${index}`;
        const resp_key = `action_resp_${index}`;
        const clos_key = `clos_resp_${index}`;
        const stat_key = `action_stat_${index}`;
  
        return (
            <div key={key}>
                <Title level={5} style={taskTitleStyle}>
                    {task.name} &nbsp; {this.geEditButton(task)}
                </Title>

                <ActionStat key={stat_key} task={task} />

                {this.renderSuggestedActivity(task)}

                <ActionResponse key={resp_key} task={task} index={index} store={this.store} />

                <ActionClosure key={clos_key} task={task} index={index} store={this.store} />
            </div>
        )
    }

    next = () => {
        this.carousel.next();
    }

    previous = () => {
        this.carousel.prev();
    }

    slideTo = (index) => {
        this.carousel.goTo(index);
    }

    renderSlider = (tasks, rowCount) => {
        if (rowCount === 0) {
            return <></>
        }

        const settings = {
            dots: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            swipeToSlide: true,
            afterChange: (current) => { this.index = current },
        };

        return (
            <div>
                <div style={sliderStyle}>
                    <Button key="back" style={{ width: "5%" }} onClick={this.previous} icon={<LeftOutlined />} shape="circle"></Button>
                    <p style={{ width: "90%" }}></p>
                    <Button key="forward" style={{ width: "5%" }} onClick={this.next} icon={<RightOutlined />} shape="circle"></Button>
                </div>

                <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                    {tasks && tasks.map((task, index) => this.renderTask(task, index))}
                    <ActionSummary key="car_as" store={this.store} slideTo={this.slideTo} />
                </Carousel>
            </div>
        )
    }

    countTag = () => {

        if (this.store.isDone) {
            return (
                <Space>
                    <Tag color="#108ee9">{this.store.rowCount} Total</Tag>
                    <Tag key="plan_tot" color="blue">{this.store.totalPlannedDuration} Planned Hours</Tag>
                    <Tag key="act_tot" color="#87d068">{this.store.totalActualDuration} Actual Hours</Tag>
                </Space>
            )
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }

        if (this.store.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    showNewTask = () => {
        this.store.setNewTask();
        this.store.showDrawer = true;
    }

    showEditTask = () => {
        const flag = this.store.asCurrent(this.index);
        this.store.showDrawer = flag;
    }

    getControls = () => {
        if (this.store.isCoach) {
            return this.getCoachControls();
        }
        else {
            return this.getMemberControls();
        }
    }

    getMemberControls = () => {
        const rowCount = this.store.rowCount;

        return (
            <div style={controlStyle}>
                <Tooltip key="sum_tip" title="To view the execution summary">
                    <Button key="sum_but" icon={<ReconciliationOutlined />} shape="circle" onClick={() => this.slideTo(rowCount)}></Button>
                </Tooltip>
            </div>
        )
    }

    getCoachControls = () => {

        const rowCount = this.store.rowCount;

        return (
            <div style={controlStyle}>
                <Space>
                    <Tooltip key="sum_tip" title="To view the execution summary">
                        <Button key="sum_but" icon={<ReconciliationOutlined />} shape="circle" onClick={() => this.slideTo(rowCount)}></Button>
                    </Tooltip>
                    <Tooltip key="add_task_tip" title="To Add New Activity">
                        <Button key="add_task" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewTask()}></Button>
                    </Tooltip>
                </Space>
            </div>
        );
    }

    render() {
        const tasks = this.store.tasks;

        // eslint-disable-next-line
        const change = this.store.change;
        const rowCount = this.store.rowCount;

        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px" }}
                extra={this.getControls()}
                title={<Title level={4}>Actions &nbsp;{this.countTag()}</Title>}>
                {this.renderSlider(tasks, rowCount)}
                {this.displayMessage()}

                <TaskDrawer taskStore={this.store} />
                <ActionResponseDrawer taskStore={this.store} />
                <ActionClosureDrawer taskStore={this.store} />
            </Card>
        )
    }

}

export default ActionList;