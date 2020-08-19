import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { Spin, Result, Carousel, Button, Steps, Space, Tag, Tooltip, Switch } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

import ObjectiveDrawer from './ObjectiveDrawer';
import Reader from "../commons/Reader";

const { Step } = Steps;

@observer
class ObjectiveList extends Component {

    index = 0;

    constructor(props) {
        super(props);
    }

    displayMessage = () => {
        const store = this.props.objectiveStore;

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

    renderObjective = (objective) => {

        const localeStart = moment(objective.scheduleStart * 1000);
        const localeEnd = moment(objective.scheduleEnd * 1000);

        const startEl = <Moment format="ll" style={{ fontWeight: "bold" }}>{localeStart}</Moment>
        const endEl = <Moment format="ll" style={{ fontWeight: "bold" }}>{localeEnd}</Moment>

        return (
            <div key={objective.id}>
                <p style={{fontWeight:"bold"}}>&nbsp;</p>
                <Reader value={objective.description} height={350} />
                <div style={{padding: 10,height:100 }}>
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

    renderSlider = (objectives, rowCount) => {
        if (rowCount == 0) {
            return <></>
        }

        const settings = {
            dots: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            swipeToSlide: true,
            afterChange: (current) => {this.index = current},
        };

        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {objectives && objectives.map((objective) => {
                            return (
                                this.renderObjective(objective)
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
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}>
                Objectives&nbsp;{this.countTag()}
            </div>
        )
    }

    countTag = () => {
        const store = this.props.objectiveStore;

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


    showNewObjective = () => {
        const store = this.props.objectiveStore;
        store.setNewObjective();
        store.showDrawer = true;
    }

    showEditObjective = () => {
        const store = this.props.objectiveStore;
        const flag = store.asCurrent(this.index);
        store.showDrawer = flag;
    }

    getControls = () => {

        const rowCount = this.props.objectiveStore.rowCount;

        return (
            <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
                <Space>
                    <Tooltip key="ed_tip" title="To edit this Objective">
                        <Button key="edit_objective" icon={<EditOutlined />} disabled={rowCount === 0} shape="circle" onClick={() => this.showEditObjective()}></Button>
                    </Tooltip>
                    <Tooltip key="add_objective_tip" title="To Add New Objective">
                        <Button key="add_objective" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewObjective()}></Button>
                    </Tooltip>
                </Space>
            </div>
        );
    }


    render() {
        const store = this.props.objectiveStore;
        const objectives = store.objectives;
        const change = store.change;

        return (
            <>
                <div style={{ border: "1px solid #ECECEC", width: "50%" }}>
                    <div style={{background:"#F5F5F5", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                        {this.getTitle()}
                        {this.getControls()}
                    </div>
                    {this.renderSlider(objectives, store.rowCount)}
                    {this.displayMessage()}
                </div>
                <ObjectiveDrawer objectiveStore={store} />
            </>
        )
    }
}
export default ObjectiveList;