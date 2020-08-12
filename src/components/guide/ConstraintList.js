import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Button, Space, Tag, Tooltip, Switch } from 'antd';
import { LeftOutlined, RightOutlined,PlusOutlined } from '@ant-design/icons';

import ConstraintDrawer from './ConstraintDrawer';
import Reader from "../commons/Reader";

@observer
class ConstraintList extends Component {

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
        store.showDrawer = true;
    }

    getControls = () => {
        return (
            <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
                <Space>
                    <Tooltip key="ed_tip" title="To elaborate this section">
                        <Switch key="ed_switch" onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
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
                <div style={{ border: "1px solid #ECECEC", width: "50%"}}>
                    <div style={{ background:"#F5F5F5", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
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