import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Typography, Row, Col, Timeline } from 'antd';
import { Affix, Button, Tooltip } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

import ChatStore from '../stores/ChatStore';

import BookPage from './BookPage';
import CurrentSessionPlan from './CurrentSessionPlan';
import Broadcast from './Broadcast';


@inject("appStore")
@observer
class HomeUI extends Component {
    constructor(props) {
        super(props);
        this.chatStore = new ChatStore();
    }

    render() {
        return (
            <>
                <Broadcast chatStore={this.chatStore} />
                <CurrentSessionPlan/>
                <Affix style={{ position: 'fixed', bottom: 10, right: 20 }}>
                    <Tooltip title="Enrolled Members">
                        <Button type="primary" icon={<TeamOutlined />} shape="circle" />
                    </Tooltip>
                </Affix>
            </>
        )
    }
}

export default HomeUI
