import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';
import 'moment-timezone';

import { Spin, Result, Carousel, Button, Tag, Tooltip, Space, Statistic } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

import ObservationDrawer from '../guide/ObservationDrawer';
import Reader from "../commons/Reader";


const contentStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const titleBarStyle = { background: "rgb(189,229,207)", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const sliderStyle = { display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" };

@observer
class ObservationList extends Component {

    index = 0;

    constructor(props) {
        super(props);
    }

    displayMessage = () => {
        const store = this.props.observationStore;

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

    renderStat = (observation) => {

        const when = moment(observation.createdAt * 1000);
        const diff = when.diff(moment(), 'days');
        const daysEl = <Statistic title="Days ago" value={diff * (-1)} valueStyle={{fontSize: "12px", fontWeight: "bold"}} />
       
        const createdAt = when.format("DD-MMM-YYYY");
        const dateEl = <Statistic title="Created On" value={createdAt} valueStyle={{fontSize: "12px", fontWeight: "bold"}}/>

        return (
            <div className="plan-stat-style">
                <div style={{ textAlign: "center", width: "70%" }}></div>
                <div style={{ textAlign: "right", width: "15%" }}>{daysEl}</div>
                <div style={{ textAlign: "right", width: "15%" }}>{dateEl}</div>
            </div >
        )
    }


    renderObservation = (observation, index) => {
        const key = `obs_${index}`
        return (
            <div key={key}>
                <Reader value={observation.description} height={350} />
                {this.renderStat(observation)}
            </div>
        )
    }

    next = () => {
        this.carousel.next();
    }

    previous = () => {
        this.carousel.prev();
    }

    renderSlider = (observations, rowCount) => {
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
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {observations && observations.map((observation, index) => {
                            return (
                                this.renderObservation(observation, index)
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
                Observations&nbsp;{this.countTag()}
            </div>
        )
    }

    countTag = () => {
        const store = this.props.observationStore;

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

    showNewObservation = () => {
        const store = this.props.observationStore;
        store.setNewObservation();
        store.showDrawer = true;
    }

    showEditObservation = () => {
        const store = this.props.observationStore;
        const flag = store.asCurrent(this.index);
        store.showDrawer = flag;
    }

    getControls = () => {
        const rowCount = this.props.observationStore.rowCount;

        return (
            <div style={controlStyle}>
                <Space>
                    <Tooltip key="ed_tip" title="To edit this Observation">
                        <Button key="edit_observation" icon={<EditOutlined />} disabled={rowCount === 0} shape="circle" onClick={() => this.showEditObservation()}></Button>
                    </Tooltip>
                    <Tooltip key="add_observation_tip" title="To Add New Observation">
                        <Button key="add_observation" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewObservation()}></Button>
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
        const store = this.props.observationStore;
        const observations = store.observations;
        const change = store.change;

        return (

            <div style={contentStyle}>
                {this.renderTitle()}
                {this.renderSlider(observations, store.rowCount)}
                {this.displayMessage()}
                <ObservationDrawer observationStore={store} />
            </div>
        )
    }
}
export default ObservationList;