import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { Spin, Result, Carousel, Button, Steps, Space, Tag, Tooltip, Statistic } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

import ObjectiveDrawer from '../guide/ObjectiveDrawer';
import Reader from "../commons/Reader";

const { Step } = Steps;
const { Countdown } = Statistic;

const contentStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const titleBarStyle = { background: "rgb(250,231,143)", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const sliderStyle = { display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" };


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

    renderStat = (objective) => {

        const localeStart = moment(objective.scheduleStart * 1000);
        const localeEnd = moment(objective.scheduleEnd * 1000);
        const diff = localeEnd.diff(moment(), 'days');

        const startEl = <Moment format="ll" style={{ fontWeight: "bold" }}>{localeStart}</Moment>
        const endEl = <Moment format="ll" style={{ fontWeight: "bold" }}>{localeEnd}</Moment>

        const createdAt = moment(objective.createdAt * 1000).format("DD-MMM-YYYY");
        const dateEl = <Statistic title="Created On" value={createdAt} valueStyle={{fontSize: "12px", fontWeight: "bold"}}/>

        var daysEl;

        if (diff >= 0) {
            daysEl = <Countdown title="Days Ahead" value={localeEnd} format="D" valueStyle={{ color: 'green' }} prefix={<ArrowUpOutlined />} suffix="days" />
        }
        else {
            daysEl = <Statistic title="Overdue" value={diff * (-1)} precision={0} valueStyle={{ color: '#cf1322' }} prefix={<ArrowDownOutlined />} suffix="days" />
        }

        return (
            <div className="plan-stat-style">
                <div style={{ textAlign: "left", width: "30%" }}>{daysEl}</div>
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

    renderObjective = (objective, index) => {

        const key = `obj_${index}`
        return (
            <div style={{ width: "100%" }} key={key}>
                {this.renderStat(objective)}
                <Reader value={objective.description} height={350} />
            </div >
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
            afterChange: (current) => { this.index = current },
        };

        return (
            <div style={sliderStyle}>
                <Button style={{ width: "3%" }} key="back" onClick={this.previous} icon={<LeftOutlined />} shape="circle"></Button>
                <div style={{ marginTop:"1%", width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {objectives && objectives.map((objective, index) => {
                            return (
                                this.renderObjective(objective, index)
                            )
                        })}
                    </Carousel>
                </div>
                <Button style={{ width: "3%" }} key="forward" onClick={this.next} icon={<RightOutlined />} shape="circle"></Button>
            </div>
        )
    }

    getTitle = () => {
        return (
            <div style={titleStyle}>
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
            <div style={controlStyle}>
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

    renderTitle = () => {
        return (
            <div style={titleBarStyle}>
                {this.getTitle()}
                {this.getControls()}
            </div>
        )
    }

    render() {
        const store = this.props.objectiveStore;
        const objectives = store.objectives;
        const change = store.change;

        return (
            <div style={contentStyle}>
                {this.renderTitle()}
                {this.renderSlider(objectives, store.rowCount)}
                {this.displayMessage()}
                <ObjectiveDrawer objectiveStore={store} />
            </div>
        )
    }
}
export default ObjectiveList;