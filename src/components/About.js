import React, { Component } from "react";
import { Card, Typography, Row, Col } from 'antd';
import { CopyrightOutlined, CaretRightOutlined } from '@ant-design/icons';

const { Text } = Typography;

const aboutStyle = {
    display: 'flex',
    flexDirection: 'column',
    background: 'lightgray',
};

const commentsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    background: 'lightgray',
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
                            <p><CopyrightOutlined />&nbsp;KRSCode.com</p>
                        </Card>
                    </Col>
                </Row>
                <Row>    
                    <Col className="gutter-row" span={24}>
                        <Card style={commentsStyle} title="We aim:">
                            <p><CaretRightOutlined />&nbsp;to aid; augumenting your collaboration </p>
                            <p><CaretRightOutlined />&nbsp;to aid; managing your coaching plan</p>
                        </Card>
                    </Col>
                </Row>
                <Row>   
                    <Col className="gutter-row" span={24}>
                        <Card style={commentsStyle} title="Our sincere thanks to:">
                            <Row>
                                <Col>
                                    <p>Rust Lang</p>
                                    <p>Actix, Juniper, Diesel</p>
                                    <p>React,MobX, Antd</p>
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
            </>
        )
    }
}

export default About;