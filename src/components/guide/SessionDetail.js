import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';


import { Card, Typography, Statistic} from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import SessionLauncher from './SessionLauncher';
import PeerStatus from './PeerStatus';

const { Meta } = Card;
const { Title,Text } = Typography;

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
            <Card title={<Title level={4}>Traits in Rust</Title>} extra={<Countdown title="Countdown" value={deadline} onFinish={this.onFinish}/>}>
                <Card>
                    <Meta
                        description="This is the 1st of the series of sessions on Traits by Gopal."
                        style={{ marginBottom: 10 }}
                    />
                </Card>

                <Card>
                    <Statistic title="Coach" value="Gopal Sankaran" valueStyle={{ color: '#3f8600' }} />
                    <p><Text><MailOutlined /> gopals@pmpowerxx.com</Text></p>
                    <p><Text><PhoneOutlined /> (91)99999 99999</Text></p>
                    <PeerStatus fuzzyId={"1-1"} />
                </Card>

                <Card>
                    <Statistic title="Actor" value="Raja Subramanian K" />
                    <p><Text><MailOutlined /> raja@pmpowerxx.com</Text></p>
                    <p><Text><PhoneOutlined /> (91)99999 xxxx9</Text></p>
                    <PeerStatus fuzzyId={"9-9"} />
                </Card>

                <Card>
                    <Meta description="Schedule" style={{ marginBottom: 10 }} />
                    <Moment format="llll" style={{"fontWeight":"bold"}}>{deadline}</Moment>
                </Card>

                <SessionLauncher title="Traits in Rust" sessionId="24" />
            </Card>
        )
    }
}

export default SessionDetail
