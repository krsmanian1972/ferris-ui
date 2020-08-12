import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Button, Space, Tag, Tooltip, Switch } from 'antd';
import { LeftOutlined, RightOutlined,PlusOutlined } from '@ant-design/icons';

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

    renderObservation = (observation) => {
        return (
            <div key={observation.id}>
                <Reader value={observation.description} height={350} />
                <div style={{ display: "flex", flexWrap: "wrap", height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 }}></div>
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
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}>Observations</div>
        )
    }

    showNewObservation = () => {
        const store = this.props.observationStore;
        store.showDrawer = true;
    }

    getControls = () => {
        return (
            <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
                <Space>
                    <Tooltip key="ed_tip" title="To elaborate this section">
                        <Switch key="ed_switch" onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
                    </Tooltip>

                    <Tooltip key="add_observation_tip" title="To Add New Observation">
                        <Button key="add_observation" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewObservation()}></Button>
                    </Tooltip>

                </Space>
            </div>
        );
    }


    render() {
        const store = this.props.observationStore;
        const observations = store.observations;
        const change = store.change;

        return (
            <>
                <div style={{ border: "1px solid lightgray", width: "50%"}}>
                    <div style={{ display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
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