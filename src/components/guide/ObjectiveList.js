import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Button, Space, Tag, Tooltip, Switch } from 'antd';
import { LeftOutlined, RightOutlined,PlusOutlined } from '@ant-design/icons';

import ObjectiveDrawer from './ObjectiveDrawer';
import Reader from "../commons/Reader";

@observer
class ObjectiveList extends Component {

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
        return (
            <div key={objective.id}>
                <Reader value={objective.description} height={350} />
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
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}>Objectives</div>
        )
    }

    showNewObjective = () => {
        const store = this.props.objectiveStore;
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
                <div style={{ border: "1px solid lightgray", marginLeft: 4, marginBottom: 4, borderRadius: "4%", width: "50%"}}>
                    <div style={{ display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
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