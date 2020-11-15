import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { Card, Typography, Spin, Result, Carousel, Button, Steps, Tooltip, Tag, Space, Statistic } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined, ArrowDownOutlined, ArrowUpOutlined, LikeOutlined } from '@ant-design/icons';

import { cardHeaderStyle } from '../util/Style';

import TaskStore from '../stores/TaskStore';

import Reader from "../commons/Reader";

import TaskDrawer from './TaskDrawer';
import ActionResponse from './ActionResponse';
import ActionResponseDrawer from './ActionResponseDrawer';

const { Title } = Typography;
const { Step } = Steps;
const { Countdown } = Statistic;

const taskTitleStyle = { color: "rgb(59,109,171)", textAlign: "center" };
const labelStyle = { marginTop: 10, marginBottom: 2, fontWeight: "bold", textAlign: "left", color: "rgb(59,109,171)" };
const taskStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const sliderStyle = { display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" };

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
                <div className="loading-container">
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

    renderStat = (task) => {

        const localeStart = moment(task.scheduleStart * 1000);
        const localeEnd = moment(task.scheduleEnd * 1000);
        const diff = localeEnd.diff(moment(), 'hours');

        const startEl = <Moment format="llll" style={{ fontWeight: "bold" }}>{localeStart}</Moment>
        const endEl = <Moment format="llll" style={{ fontWeight: "bold" }}>{localeEnd}</Moment>

        const createdAt = moment(task.createdAt * 1000).format("DD-MMM-YYYY");
        const dateEl = <Statistic title="Created On" value={createdAt} valueStyle={{ fontSize: "12px", fontWeight: "bold" }} />

        var hoursEl;

        if (task.respondedDate) {
            const respondedDate = moment(task.respondedDate * 1000).format("DD-MMM-YYYY");
            hoursEl = <Statistic title="Responded On" value={respondedDate} valueStyle={{ fontSize: "12px", fontWeight: "bold", color: "green" }} prefix={<LikeOutlined />}/>
        }
        else {
            if (diff >= 0) {
                hoursEl = <Countdown title="Hours Ahead" value={localeEnd} format="HH:mm" valueStyle={{ color: 'green' }} prefix={<ArrowUpOutlined />} suffix="hours" />
            }
            else {
                hoursEl = <Statistic title="Overdue" value={diff * (-1)} precision={0} valueStyle={{ color: '#cf1322' }} prefix={<ArrowDownOutlined />} suffix="hours" />
            }
        }

        return (
            <div className="task-stat">
                <div style={{ textAlign: "left", width: "30%" }}>{hoursEl}</div>
                <div style={{ textAlign: "center", width: "50%" }}>
                    <Steps progressDot current={1} size="small">
                        <Step title={startEl} description="Start" />
                        <Step title={endEl} description="End" />
                    </Steps>
                </div>
                <div style={{ textAlign: "right", width: "20%" }}>{dateEl}</div>
            </div >
        )
    }

    renderTask = (task, index) => {
        const key = `action_${index}`;
        const resp_key = `action_resp_${index}`;

        return (
            <div key={key}>
                <Title level={5} style={taskTitleStyle}>{task.name}</Title>

                {this.renderStat(task)}

                <p style={labelStyle}>Suggested Activity</p>
                <div style={taskStyle}>
                    <Reader value={task.description} readOnly={true} height={350} />
                </div>

                <ActionResponse key={resp_key} task={task} index={index} store={this.store} />
            </div>
        )
    }

    next = () => {
        this.carousel.next();
    }

    previous = () => {
        this.carousel.prev();
    }

    renderSlider = (tasks, rowCount) => {
        if (rowCount == 0) {
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
                    {tasks && tasks.map((task, index) => {
                        return (
                            this.renderTask(task, index)
                        )
                    })}
                </Carousel>
            </div>
        )
    }

    countTag = () => {

        if (this.store.isDone) {
            return <Tag color="#108ee9">{this.store.rowCount} Total</Tag>
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
    }


    getCoachControls = () => {

        const rowCount = this.store.rowCount;

        return (
            <div style={controlStyle}>
                <Space>
                    <Tooltip key="ed_act_tip" title="To edit the suggested activity">
                        <Button key="edit_task" icon={<EditOutlined />} disabled={rowCount === 0} shape="circle" onClick={() => this.showEditTask()}></Button>
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
            </Card>
        )
    }

}

export default ActionList;