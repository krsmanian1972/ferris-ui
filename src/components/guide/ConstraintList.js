import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Button, Tag, Tooltip, Space } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

import ConstraintDrawer from './ConstraintDrawer';
import Reader from "../commons/Reader";

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

    renderOption = (option) => {
        return (
            <div key={option.id}>
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
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {options && options.map((option) => {
                            return (
                                this.renderOption(option)
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
            <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
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


    render() {
        const store = this.props.constraintStore;
        const options = store.options;
        const change = store.change;

        return (
            <>
                <div style={{ background:"rgb(242,242,242)", width: "50%", marginRight: "10px" }}>
                    <div style={{ background: "rgb(209,69,77)", color: "white",  display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                        {this.getTitle()}
                        {this.getControls()}
                    </div>
                    {this.renderSlider(options, store.rowCount)}
                    {this.displayMessage()}
                </div>
                <ConstraintDrawer constraintStore={store} />
            </>
        )
    }
}
export default ConstraintList;