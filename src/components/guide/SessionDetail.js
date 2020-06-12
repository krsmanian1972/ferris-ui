import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Avatar, Typography, Statistic, Row, Col, Tag} from 'antd';
import { TagOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import 'moment-timezone'

import SessionLauncher from './SessionLauncher';

const { Meta } = Card;
const { Text } = Typography;

const { Countdown } = Statistic;

const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30; 

@inject("appStore")
@observer
class SessionDetail extends Component {
    constructor(props) {
        super(props);
    }

    onFinish = () => {
        console.log("Finished");
    }
    render() {
        return (
            <Card title="Traits in Rust"
                extra={<a href="#">Current Session</a>}>
                <Meta
                    avatar={<Avatar icon={<TagOutlined />} />}
                    description="This is the 1st of the series of sessions on Traits by Gopal."
                    style={{ marginBottom: 10 }}
                />
                <Row>
                    <Col span={12}>
                        <Card>
                            <Statistic title="Coach" value="Gopal Sankaran" valueStyle={{ color: '#3f8600' }}/>
                            <Row><Text><MailOutlined/> gopals@pmpowerxx.com</Text></Row>
                            <Row><Text><PhoneOutlined/> (91)99999 99999</Text></Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                            <Statistic title="Audience" value="Raja Subramanian K"/>
                            <Row><Text><MailOutlined/> raja@pmpowerxx.com</Text></Row>
                            <Row><Text><PhoneOutlined/> (91)99999 xxxx9</Text></Row>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col span={12}>
                        <Card>
                            <Meta description="Schedule" style={{ marginBottom: 5 }} />
                            <Row><time datetime={deadline}>{deadline.toLocaleString()}</time></Row>
                            <Row><Countdown title="Countdown" value={deadline} onFinish={this.onFinish} /></Row>
                        </Card>
                    </Col>
                    <Col span={12}>  
                      <SessionLauncher/>
                    </Col>
                </Row>
            </Card>
        )
    }
}

export default SessionDetail
