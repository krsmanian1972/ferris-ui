import React, { Component  } from 'react';
import { inject } from 'mobx-react';
import { Carousel,Card, Typography,Row,Col,Timeline } from 'antd';
import { Affix, Button } from 'antd';
import { TeamOutlined } from '@ant-design/icons';



const { Title, Text } = Typography;

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
class HomeUI extends Component {
    constructor(props) {
        super(props);
    }
    
    getCode = () => {
        var code = String.raw`
            struct Circle {
                x: f64,
                y: f64,
                radius: f64,
            }
            
            trait HasArea {
                fn area(&self) -> f64;
            }
            
            impl HasArea for Circle {
                fn area(&self) -> f64 {
                    std::f64::consts::PI * (self.radius * self.radius)
                }
            }     
        `;

        return(
            <pre>
                {code}
            </pre>

        )
    }
    stage = () => {
        return(
            <Card style={stageStyle} title={<Title level={4}>Session - Traits in RUST</Title>}>
                 <div style={videoStyle}>
                    <p>A trait is a language feature that tells the Rust compiler about functionality a type must provide.</p>
                    <Text code="true">  
                        {this.getCode()}
                    </Text>
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

    members = () => {
        return (
            <Carousel>
                <div>
                    <h3>Raja</h3>
                </div>
                <div>
                    <h3>Harini</h3>
                </div>
                <div>
                    <h3>Skanda</h3>
                </div>
                <div>
                    <h3>Subbu</h3>
                </div>
          </Carousel>
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

                <Affix style={{position:'fixed',bottom:10,right:10}}>
                    <Button type="primary" icon= {<TeamOutlined/>} shape="circle"/>
                </Affix>
            </>  
        )
    }
}

export default HomeUI
