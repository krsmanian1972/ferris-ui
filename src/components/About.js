import React, { Component } from "react";
import { Card, Typography, Row, Col } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

const { Text } = Typography;

const aboutStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom:5,
};


const commentsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    marginBottom:5,
};



class About extends Component {
    render() {
        return (
            <>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={24}>
                        <Card style={aboutStyle} title="About:">
                            <p>Ferris - The Coaching Assistant</p>
                            <p>Version 0.1</p>
                            <p>May-2020</p>
                            <p>Maintained by&nbsp;KRSCode.com</p>
                        </Card>
                    </Col>
                </Row>
                <Row>    
                    <Col className="gutter-row" span={24}>
                        <Card style={commentsStyle} title="We aim to aid:">
                            <p><CaretRightOutlined />&nbsp;augumenting your collaboration </p>
                            <p><CaretRightOutlined />&nbsp;managing your coaching plan</p>
                        </Card>
                    </Col>
                </Row>
                <Row>   
                    <Col className="gutter-row" span={24}>
                        <Card style={commentsStyle} title="Our sincere thanks to:">
                            <Row>
                                <Col>
                                    <p>Moz://a, Rust Lang</p>
                                    <p>Actix, Juniper, Diesel</p>
                                    <p>React,MobX</p>
                                    <p>MySql</p>
                                    <p>And the Open-Source Community</p>
                                </Col>    
                                <Col>
                                    <div className="logo"/>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row>   
                    <Col className="gutter-row" span={24}>
                        <Card style={commentsStyle} title="For Support">
                            <Row>
                                <Col>
                                    <p>Raja Subramanian K</p>
                                    <p>krsmanian1972@gmail.com</p>
                                </Col>    
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </>
        )
    }
}

export default About;