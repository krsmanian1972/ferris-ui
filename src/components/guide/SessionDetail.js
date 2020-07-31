import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';


import { Card, Typography, Statistic} from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import SessionLauncher from './SessionLauncher';
import PeerStatus from './PeerStatus';
import MiniBoard from './MiniBoard';

const { Meta } = Card;
const { Title,Text } = Typography;

const { Countdown } = Statistic;

const deadline = moment().add(5, 'minute');

const SESSION_USER_FUZZY_ID = 'd91e5527-9cc3-4d56-9c69-d386c9cba535';

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
                    <Meta description="Schedule" style={{ marginBottom: 10 }} />
                    <Moment format="llll" style={{fontWeight:"bold"}}>{deadline}</Moment>
                    <SessionLauncher title="Traits in Rust" sessionId="24" />
                </Card>

                
                <Card>
                    <Statistic title="Coach" value="Gopal Sankaran" valueStyle={{ color: '#3f8600' }} />
                    <p><Text><MailOutlined /> gopals@pmpowerxx.com</Text></p>
                    <p><Text><PhoneOutlined /> (91)99999 99999</Text></p>
                </Card>

                <Card>
                    <Statistic title="Actor" value="Raja Subramanian K" />
                    <p><Text><MailOutlined /> raja@pmpowerxx.com</Text></p>
                    <p><Text><PhoneOutlined /> (91)99999 xxxx9</Text></p>
                </Card>

                
            </Card>
        )
    }
}

export default SessionDetail
