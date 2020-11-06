import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import 'moment-timezone';

import { Spin, Result, Carousel, Button, Tag, Tooltip, Space, Statistic } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

import ConstraintDrawer from '../guide/ConstraintDrawer';
import Reader from "../commons/Reader";

const contentStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const titleBarStyle = { background: "rgb(209,69,77)", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" };
const titleStyle = { display: "flex", color: "white", alignItems: "center", paddingLeft: 10, fontWeight: "bold" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const sliderStyle = { display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" };

@observer
class ConstraintList extends Component {

    index = 0;

    constructor(props) {
        super(props);
    }

    displayMessage = () => {
        const store = this.props.constraintStore;

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

    renderStat = (option) => {

        const when = moment(option.createdAt * 1000);
        const diff = when.diff(moment(), 'days');
        const daysEl = <Statistic title="Days ago" value={diff * (-1)} valueStyle={{ fontSize: "12px", fontWeight: "bold" }} />

        const createdAt = when.format("DD-MMM-YYYY");
        const dateEl = <Statistic title="Created On" value={createdAt} valueStyle={{ fontSize: "12px", fontWeight: "bold" }} />

        return (
            <div className="plan-stat-style">
                <div style={{ textAlign: "center", width: "70%" }}></div>
                <div style={{ textAlign: "right", width: "15%" }}>{daysEl}</div>
                <div style={{ textAlign: "right", width: "15%" }}>{dateEl}</div>
            </div >
        )
    }


    renderOption = (option, index) => {
        const key = `opt_${index}`
        return (
            <div key={key}>
                {this.renderStat(option)}
                <Reader value={option.description} height={350} />
            </div>
        )
    }

    next = () => {
        this.carousel.next();
    }

    previous = () => {
        this.carousel.prev();
    }

    renderSlider = (options, rowCount) => {
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
                <div style={{marginTop:"1%", width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {options && options.map((option) => {
                            return (
                                this.renderOption(option)
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
                Opportunities&nbsp;{this.countTag()}
            </div>
        )
    }

    countTag = () => {
        const store = this.props.constraintStore;

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

    showNewOption = () => {
        const store = this.props.constraintStore;
        store.setNewOption();
        store.showDrawer = true;
    }

    showEditOption = () => {
        const store = this.props.constraintStore;
        const flag = store.asCurrent(this.index);
        store.showDrawer = flag;
    }

    getControls = () => {

        const rowCount = this.props.constraintStore.rowCount;

        return (
            <div style={controlStyle}>
                <Space>
                    <Tooltip key="ed_tip" title="To edit this Option">
                        <Button key="edit_option" icon={<EditOutlined />} disabled={rowCount === 0} shape="circle" onClick={() => this.showEditOption()}></Button>
                    </Tooltip>
                    <Tooltip key="add_option_tip" title="To Add New Option">
                        <Button key="add_option" icon={<PlusOutlined />} shape="circle" onClick={() => this.showNewOption()}></Button>
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
        const store = this.props.constraintStore;
        const options = store.options;
        const change = store.change;

        return (
            <div style={contentStyle}>
                {this.renderTitle()}
                {this.renderSlider(options, store.rowCount)}
                {this.displayMessage()}
                <ConstraintDrawer constraintStore={store} />
            </div>
        )
    }
}
export default ConstraintList;