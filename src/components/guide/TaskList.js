import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Button, Space, Tag, Tooltip, Switch } from 'antd';
import { LeftOutlined, RightOutlined,PlusOutlined } from '@ant-design/icons';

import TaskDrawer from './TaskDrawer';
import Editor from "../commons/Editor";

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
        return (
            <div key={task.id}>
                <Editor id="tasks" value={task.description} readOnly={true} height={350} />
                <div style={{ display: "flex", flexWrap: "wrap", height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 }}>
                    <Tag color="blue">10-Sep-2020</Tag>
                    <Tag color="blue">10-Sep-2020</Tag>
                    <Tag color="blue">Progress</Tag>
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
                        {objectives && objectives.map((objective) => {
                            return (
                                this.renderTask(objective)
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
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}>Objectives</div>
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

                    <Tooltip key="add_objective_tip" title="To Add New Objective">
                        <Button key="add_objective" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewTask()}></Button>
                    </Tooltip>

                </Space>
            </div>
        );
    }


    render() {
        const store = this.props.taskStore;
        const objectives = store.objectives;
        const change = store.change;

        return (
            <>
                <div style={{ border: "1px solid lightgray", marginRight: 4, marginBottom: 4, borderRadius: "4%" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                        {this.getTitle()}
                        {this.getControls()}
                    </div>
                    {this.renderSlider(objectives, store.rowCount)}
                    {this.displayMessage()}
                </div>
                <TaskDrawer taskStore={store} />
            </>
        )
    }

}

export default TaskList;