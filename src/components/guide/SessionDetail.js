import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Avatar, Typography, Statistic, Row, Col, Tag, Space, Divider } from 'antd';
import { TagOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import SessionLauncher from './SessionLauncher';

const { Meta } = Card;
const { Text } = Typography;

const { Countdown } = Statistic;

const deadline = moment().add(5, 'minute');

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
            <Card title="Traits in Rust" extra={<a href="#">Current Session</a>}>
                <Meta
                    description="This is the 1st of the series of sessions on Traits by Gopal."
                    style={{ marginBottom: 10 }}
                />

                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Card>
                            <Statistic title="Coach" value="Gopal Sankaran" valueStyle={{ color: '#3f8600' }} />
                            <p></p>
                            <p><Text><MailOutlined /> gopals@pmpowerxx.com</Text></p>
                            <p><Text><PhoneOutlined /> (91)99999 99999</Text></p>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                            <Statistic title="Audience" value="Raja Subramanian K" />
                            <p></p>
                            <p><Text><MailOutlined /> raja@pmpowerxx.com</Text></p>
                            <p><Text><PhoneOutlined /> (91)99999 xxxx9</Text></p>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Card style={{ height: 135 }}>
                            <Meta description="Schedule" style={{ marginBottom: 10 }} />
                            <Moment format="llll">{deadline}</Moment>
                            <Countdown title="" value={deadline} onFinish={this.onFinish} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <SessionLauncher title="Traits in Rust" />
                    </Col>
                </Row>
            </Card>
        )
    }
}

export default SessionDetail
