import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { Spin, Result, Carousel, Button, Space, Steps, Tooltip, Switch } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';

import TaskDrawer from './TaskDrawer';
import Reader from "../commons/Reader";

const { Step } = Steps;

@observer
class TaskList extends Component {
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

    renderTask = (task) => {
        const localeStart = moment(task.scheduleStart*1000);
        const localeEnd = moment(task.scheduleEnd*1000);

        const startEl = <Moment format="llll" style={{ fontWeight: "bold" }}>{localeStart}</Moment>
        const endEl = <Moment format="llll" style={{ fontWeight: "bold" }}>{localeEnd}</Moment>

        return (
            <div key={task.id}>
                <Reader id={task.id} value={task.description} readOnly={true} height={350} />
                <div style={{ paddingBottom: 10 }}>
                    <Steps progressDot current={0} size="small">
                        <Step title={startEl} description="Start" />
                        <Step title={endEl} description="End" />
                    </Steps>
                </div>
            </div>
        )
    }

    next = () => {
        this.carousel.next();
    }

    previous = () => {
        this.carousel.prev();
    }

    onEdit = (mode) => {
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
        };

        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {tasks && tasks.map((task) => {
                            return (
                                this.renderTask(task)
                            )
                        })}
                    </Carousel>
                </div>
                <Button key="forward" onClick={this.next} icon={<RightOutlined />} shape="square"></Button>
            </div>
        )
    }

    getTitle = () => {
        return (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}>Onwards</div>
        )
    }

    showNewTask = () => {
        const store = this.props.taskStore;
        store.showDrawer = true;
    }


    getControls = () => {
        return (
            <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
                <Space>
                    <Tooltip key="ed_tip" title="To elaborate this section">
                        <Switch key="ed_switch" onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
                    </Tooltip>

                    <Tooltip key="add_task_tip" title="To Add New Activity">
                        <Button key="add_task" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewTask()}></Button>
                    </Tooltip>

                </Space>
            </div>
        );
    }


    render() {
        const store = this.props.taskStore;
        const tasks = store.tasks;
        const change = store.change;

        return (
            <>
                <div style={{ border: "1px solid lightgray", width: "50%" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                        {this.getTitle()}
                        {this.getControls()}
                    </div>
                    {this.renderSlider(tasks, store.rowCount)}
                    {this.displayMessage()}
                </div>
                <TaskDrawer taskStore={store} />
            </>
        )
    }

}

export default TaskList;