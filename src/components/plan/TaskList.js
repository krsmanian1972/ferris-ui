import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { Spin, Result, Carousel, Button, Steps, Tooltip, Tag, Space,Statistic } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined,ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

import TaskDrawer from '../guide/TaskDrawer';
import Reader from "../commons/Reader";

const { Step } = Steps;
const { Countdown } = Statistic;

const contentStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const titleBarStyle = { background: "rgb(59,109,171)", color: "white", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const sliderStyle = { display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" };

@observer
class TaskList extends Component {

    index = 0;

    constructor(props) {
        super(props);
    }

    displayMessage = () => {
        const store = this.props.taskStore;

        if (store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (store.isError) {
            return (
                <Result status="warning" title={store.message.help} />
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
        const dateEl = <Statistic title="Created On" value={createdAt} valueStyle={{fontSize: "12px", fontWeight: "bold"}}/>

        var hoursEl;

        if (diff >= 0) {
            hoursEl = <Countdown title="Hours Ahead" value={localeEnd} format="HH:mm" valueStyle={{ color: 'green' }} prefix={<ArrowUpOutlined />} suffix="hours" />
        }
        else {
            hoursEl = <Statistic title="Overdue" value={diff * (-1)} precision={0} valueStyle={{ color: '#cf1322' }} prefix={<ArrowDownOutlined />} suffix="hours" />
        }

        return (
            <div className="plan-stat-style">
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

    renderTask = (task,index) => {
        const key = `task_${index}`

        return (
            <div key={key}>
                <p style={{ fontWeight: "bold" }}>{task.name}</p>
                <Reader id={task.id} value={task.description} readOnly={true} height={350} />
                {this.renderStat(task)}
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
            <div style={sliderStyle}>
                <Button key="back" style={{ width: "3%" }} onClick={this.previous} icon={<LeftOutlined />} shape="circle"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {tasks && tasks.map((task,index) => {
                            return (
                                this.renderTask(task,index)
                            )
                        })}
                    </Carousel>
                </div>
                <Button key="forward" style={{ width: "3%" }} onClick={this.next} icon={<RightOutlined />} shape="circle"></Button>
            </div>
        )
    }

    getTitle = () => {
        return (
            <div style={titleStyle}>
                Onwards&nbsp;{this.countTag()}
            </div>
        )
    }

    countTag = () => {
        const store = this.props.taskStore;

        if (store.isDone) {
            return <Tag color="#108ee9">{store.rowCount} Total</Tag>
        }

        if (store.isError) {
            return <Tag color="red">...</Tag>
        }

        if (store.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    showNewTask = () => {
        const store = this.props.taskStore;
        store.setNewTask();
        store.showDrawer = true;
    }

    showEditTask = () => {
        const store = this.props.taskStore;
        const flag = store.asCurrent(this.index);
        store.showDrawer = flag;
    }


    getControls = () => {

        const rowCount = this.props.taskStore.rowCount;

        return (
            <div style={controlStyle}>
                <Space>
                    <Tooltip key="ed_tip" title="To edit this activity">
                        <Button key="edit_task" icon={<EditOutlined />} disabled={rowCount === 0} shape="circle" onClick={() => this.showEditTask()}></Button>
                    </Tooltip>
                    <Tooltip key="add_task_tip" title="To Add New Activity">
                        <Button key="add_task" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewTask()}></Button>
                    </Tooltip>
                </Space>
            </div>
        );
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
        const store = this.props.taskStore;
        const tasks = store.tasks;
        const change = store.change;

        return (
            <div style={contentStyle}>
                {this.renderTitle()}
                {this.renderSlider(tasks, store.rowCount)}
                {this.displayMessage()}
                <TaskDrawer taskStore={store} />
            </div>
        )
    }

}

export default TaskList;