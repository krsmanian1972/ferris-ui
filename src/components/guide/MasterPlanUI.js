import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Row, Col, Typography, Tooltip, Space} from 'antd';
import { ScissorOutlined, CloseOutlined, AimOutlined, PlusOutlined } from '@ant-design/icons';

import FlowComposer from '../flow/FlowComposer';

const { Title } = Typography;

const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
};

const graphPaperStyle = {
    border: "1px solid black",
    borderRadius: "12px",
    maxHeight: window.innerHeight * .82,
    overflowY: "auto"
}

@inject("appStore")
@observer
class MasterPlanUI extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isReady : false
        }

    }

    componentDidMount() {
        this.composer =  new FlowComposer(this.container);
        this.composer.populateTasks();
        this.composer.populateLinks();
    }

    deleteSelectedLine = () => {
        if(this.composer) {
            this.composer.deleteSelectedLine();
        }
    }

    deleteSelectedTask = () => {
        if(this.composer) {
            this.composer.deleteSelectedTask();
        }
    }
   

 
    renderControls = () => {
        return (
            <Row>
                <Col span={20}>
                    <Title level={4}>Planning</Title>
                </Col>
                <Col span={2}>
                    <div style={{textAlign: "left", paddingRight: "10px" }}>
                        <Space>
                            <Tooltip title="Define A New Task">
                                <Button key="defineTask" onClick={this.defineTask} type="primary" icon={<AimOutlined />} shape={"circle"} />
                            </Tooltip>

                            <Tooltip title="Pull Tasks">
                                <Button key="pullTasks" onClick={this.pullTasks} style={{ border: "1px solid green", color: "green" }} icon={<PlusOutlined />} shape={"circle"} />
                            </Tooltip>
                        </Space>
                    </div>
                </Col>
                <Col span={2}>
                    <div style={{textAlign: "left", paddingRight: "10px" }}>
                        <Space>
                            <Tooltip title="Delete Selected Link">
                                <Button key="delLine" danger onClick={this.deleteSelectedLine} type="primary" icon={<ScissorOutlined />} shape={"circle"} />
                            </Tooltip>

                            <Tooltip title="Delete Selected Task">
                                <Button key="delTask" danger onClick={this.deleteSelectedTask} type="primary" icon={<CloseOutlined />} shape={"circle"} />
                            </Tooltip>
                        </Space>
                    </div>
                </Col>
            </Row>
        )
    }


    render() {
        return (
            <div>
                {this.renderControls()}
                <div key="graphPaper" style={graphPaperStyle}>
                    <div key="container" style={containerStyle} id="container" ref={ref => (this.container = ref)} />
                </div>
            </div>
        )
    }
}

export default MasterPlanUI;