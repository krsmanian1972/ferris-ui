import React, { Component } from "react";
import { Card, Row, Col } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { cardHeaderStyle } from "./util/Style";


const aboutStyle = {
    marginBottom: 5,
};


const commentsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    marginBottom: 5,
};



class About extends Component {

    render() {
        return (
            <>
                <Card headStyle={cardHeaderStyle} style={commentsStyle} title="We aim to aid:">
                    <p><CaretRightOutlined />&nbsp;augumenting your collaboration </p>
                    <p><CaretRightOutlined />&nbsp;managing your coaching plan</p>
                </Card>
                <Card headStyle={cardHeaderStyle} style={commentsStyle} title="Our sincere thanks to:">
                    <Row>
                        <Col>
                            <p>Moz://a, Rust Lang</p>
                            <p>Actix, Juniper, Diesel</p>
                            <p>React,MobX</p>
                            <p>MySql</p>
                            <p>And the Open-Source Community</p>
                        </Col>
                        <Col>
                            <div className="logo" />
                        </Col>
                    </Row>
                </Card>
                <Card headStyle={cardHeaderStyle} style={aboutStyle} title="Ferris - The Coaching Assistant">
                    <p>Version 0.3</p>
                    <p>Jan-2021</p>
                    <p>Maintained by&nbsp;KRSCode.com</p>
                </Card>
                <Card headStyle={cardHeaderStyle} style={commentsStyle} title="For Support">
                    <p>Raja Subramanian K</p>
                    <p>krsmanian1972@gmail.com</p>
                </Card>
            </>
        )
    }
}

export default About;