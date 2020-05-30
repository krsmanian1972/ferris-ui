import React, { Component } from "react";
import { Card, Typography} from 'antd';
import {CopyrightOutlined,CaretRightOutlined} from '@ant-design/icons';

const { Title, Text } = Typography;

const cardStyle = {
    display: 'flex',
    flexDirection:'column',
    alignItems: 'center',
};

const aboutStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
};

const noticeStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginTop:'5%',
    justifyContent: 'left',
    alignItems: 'left'
};

const purposeStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginTop:'5%',
    justifyContent: 'left',
    alignItems: 'left'
};


class About extends Component {
    render() {
        return (
            <Card style={cardStyle} title={<Title level={4}>Ferris - The Coaching Assistant</Title>}>
                <div style={aboutStyle}>
                    <Text>Version 1.0</Text>
                    <Text>May-2020</Text>
                    <Text><CopyrightOutlined/>&nbsp;KRSCode.com</Text>
                </div>
                <div style={purposeStyle}>
                    <Text>The primary objectives of this micro-site are:</Text> 
                    <Text><CaretRightOutlined />&nbsp;to enhance collboration between Coach and Protege</Text>
                    <Text><CaretRightOutlined />&nbsp;to manage coaching plan</Text>
                </div>
                <div style={noticeStyle}>
                    <Text>Some of the listed features are being developed and will be available shortly.</Text>
                    <Text>Looking forward to your support and encouragement.</Text>
                    <Text>&nbsp;</Text>
                    <Text>Thank you!!!</Text>
                </div>
            </Card>
        )
    }
}

export default About;