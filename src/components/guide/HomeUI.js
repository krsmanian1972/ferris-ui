import React, { Component  } from 'react';
import { inject, observer} from 'mobx-react';
import { Card, Typography,Row,Col,Timeline,Space } from 'antd';
import { Affix, Button,Tooltip } from 'antd';
import { TeamOutlined,VideoCameraOutlined,BookOutlined } from '@ant-design/icons';

import BookPage from './BookPage'
import Broadcast from './Broadcast'

const { Title } = Typography;


const stageStyle = {
    display: 'flex',
    flexDirection:'column',
    alignItems: 'left',
};

const videoStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
};

@inject("appStore")
@observer
class HomeUI extends Component {
    constructor(props) {
        super(props);
    }
  
    changeView = (key,e) => {
        e.preventDefault();
        this.props.appStore.setMode(key);
     }

    getComponent = () => {
        let key = this.props.appStore.mode;
        if(key=="book") {
            return <BookPage/>
        }
        return <Broadcast/>    
    }

    stage = () => {
        return(
            <Card>
                 <Row>
                     <Col span={22}>
                        <Title level={4}>Session - Traits in RUST</Title>
                    </Col>
                     <Col span={2}>
                         <Space>
                            <Tooltip title="Camera">
                                <Button id="camera"  onClick={(e) => this.changeView("camera", e)} type="primary" icon= {<VideoCameraOutlined/>} shape="circle"/>
                            </Tooltip>     
                            <Tooltip title="Book View">
                                <Button id="book"  onClick={(e) => this.changeView("book", e)} type="primary" icon= {<BookOutlined/>} shape="circle"/>
                            </Tooltip>
                         </Space>   
                     </Col>
                 </Row>
                 <div style={videoStyle}>
                    {this.getComponent()}
                </div>
            </Card>
        )
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
                        {this.stage()}
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
