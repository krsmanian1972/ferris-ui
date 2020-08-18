import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Button, Tag, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined,PlusOutlined, EditOutlined } from '@ant-design/icons';

import ObservationDrawer from './ObservationDrawer';
import Reader from "../commons/Reader";

@observer
class ObservationList extends Component {

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

    renderObservation = (observation,index) => {
        return (
            <div key={observation.id}>
                <Reader value={observation.description} height={350} />
                <div style={{ display: "flex", flexWrap: "wrap", height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 }}></div>
                <div style={{float:"right",paddingLeft: 10}}>
                   <Tooltip key="ed_tip" title="To edit this observation">
                        <Button key="edit_observation" icon={<EditOutlined />} shape="circle" onClick={() => this.showEditObservation(observation)}></Button>
                    </Tooltip>
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
        };

        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {observations && observations.map((observation) => {
                            return (
                                this.renderObservation(observation)
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

    showEditObservation = (observation) => {
        const store = this.props.observationStore;
        store.setCurrentObservation(observation);
        store.showDrawer = true;
    }

    getControls = () => {
        return (
            <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
                <Tooltip key="add_observation_tip" title="To Add New Observation">
                    <Button key="add_observation" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewObservation()}></Button>
                </Tooltip>
            </div>
        );
    }


    render() {
        const store = this.props.observationStore;
        const observations = store.observations;
        const change = store.change;

        return (
            <>
                <div style={{ border: "1px solid #ECECEC", width: "50%"}}>
                    <div style={{ background:"#F5F5F5", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                        {this.getTitle()}
                        {this.getControls()}
                    </div>
                    {this.renderSlider(observations, store.rowCount)}
                    {this.displayMessage()}
                </div>
                <ObservationDrawer observationStore={store} />
            </>
        )
    }
}
export default ObservationList;