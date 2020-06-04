import React, { Component  } from 'react';
import { inject, observer} from 'mobx-react';
import { Card, Typography,Row,Col,Timeline} from 'antd';
import { Affix, Button,Tooltip } from 'antd';
import { TeamOutlined} from '@ant-design/icons';

import ChatStore from '../stores/ChatStore';

import BookPage from './BookPage'
import Broadcast from './Broadcast'

const { Title } = Typography;

const stageStyle = {
    display: 'flex',
    flexDirection:'column',
    alignItems: 'left',
};



@inject("appStore")
@observer
class HomeUI extends Component {
    constructor(props) {
        super(props);
        this.chatStore = new ChatStore();
    }
    
    steps = () => {
        return (
            <Card style={stageStyle} title={<Title level={4}>Session Progress</Title>}>
                <Timeline>
                    <Timeline.Item color="green">Introduction</Timeline.Item>
                    <Timeline.Item color="green">Returning Traits with Dyn</Timeline.Item>
                    <Timeline.Item color="green">Drop Trait</Timeline.Item>
                    <Timeline.Item color="blue">
                        <p>Solve Example 1</p>
                        <p>Solve Example 2</p>
                    </Timeline.Item>
                    <Timeline.Item color="gray">Impl Trait
                        <p>Example1</p>
                        <p>Example2</p>
                    </Timeline.Item>
                    <Timeline.Item color="gray">Assignments 
                        <p>Exercise - 1</p>
                        <p>Exercise - 2</p>
                    </Timeline.Item>
                </Timeline>
            </Card>
        )
    }

    render() {
        return (
            <>
                <Row>
                    <Col span={24}>
                        <Broadcast chatStore={this.chatStore}/>
                    </Col>
                </Row>
                <Row>    
                    <Col span={24}>
                        {this.steps()}
                    </Col>  
                </Row>

                <Affix style={{position:'fixed',bottom:10,right:20}}>
                    <Tooltip title="Enrolled Members">
                        <Button type="primary" icon= {<TeamOutlined/>} shape="circle"/>
                    </Tooltip>
                </Affix>
            </>  
        )
    }
}

export default HomeUI
