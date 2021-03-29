import React from 'react';
import { Card, Row, Col } from 'antd';
import { cardHeaderStyle } from "./util/Style";
import Premise from "./Premise";

const aboutStyle = {
    marginBottom: 5,
};

const commentsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    marginBottom: 5,
};

function About() {

    return (
        <>
            <Premise />
            <Card headStyle={cardHeaderStyle} style={commentsStyle} title="Our sincere thanks to:">
                <Row>
                    <Col>
                        <p>Moz://a, Rust Lang</p>
                        <p>Actix, Juniper, Diesel</p>
                        <p>MySql</p>
                        <p>Node.js, Webrtc.org, GStreamer, Janus</p>
                        <p>React, MobX, Antd, Three.js, Fabric.js</p>
                        <p>The programing fraternity and coaches</p>
                    </Col>
                    <Col>
                        <div className="logo" />
                    </Col>
                </Row>
            </Card>
            <Card headStyle={cardHeaderStyle} style={aboutStyle} title="Ferris - The Coaching Assistant">
                <p>Version 0.4</p>
                <p>Mar-2021</p>
                <p>Maintained by&nbsp;KRSCode.com</p>
            </Card>
            <Card headStyle={cardHeaderStyle} style={commentsStyle} title="For Support">
                <p>Raja Subramanian K</p>
                <p>krsmanian1972@gmail.com</p>
            </Card>
        </>
    )
}

export default About;