import React, { Component } from 'react';
import {inject, observer } from 'mobx-react';
import { Tabs, Button, Tooltip } from 'antd';
import { ThunderboltOutlined, CalendarOutlined, HourglassOutlined, PlusCircleOutlined } from '@ant-design/icons';

import SessionDetail from './SessionDetail';
import TodaySessions from './TodaySessions';

import SessionListStore from '../stores/SessionListStore';
import SessionStore from '../stores/SessionStore';

import ScheduleDrawer from './ScheduleDrawer';

const { TabPane } = Tabs;

@inject("appStore")
@observer
class ProgramUI extends Component {
    constructor(props) {
        super(props);

        this.sessionListStore = new SessionListStore({ apiProxy: props.appStore.apiProxy });
        
        this.sessionStore = new SessionStore({ 
            apiProxy: props.appStore.apiProxy,
            sessionListStore: this.sessionListStore
            });
    }


    showNewSchedule = () => {
        this.sessionStore.showDrawer = true;
    }

    newScheduleButton = () => {
        return (
            <Tooltip title="Create New Session">
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={()=>this.showNewSchedule()}>New</Button>
            </Tooltip>
        )
    }

    render() {
        return (
            <>
                <Tabs defaultActiveKey="1" tabPosition="top" style={{ minHeight: 450 }} tabBarExtraContent={this.newScheduleButton()}>
                    <TabPane key="1" tab={<span><ThunderboltOutlined />Current</span>} style={{ maxHeight: 450, overflow: "auto" }}>
                        <SessionDetail sessionId={24} sessionStore = {this.sessionStore}/>
                    </TabPane>

                    <TabPane key="2" tab={<span><HourglassOutlined />Today</span>} style={{ maxHeight: 450, overflow: "auto" }}>
                        <TodaySessions sessionListStore = {this.sessionListStore}/>
                    </TabPane>

                    <TabPane key="3" tab={<span><CalendarOutlined />Next</span>}>
                        <TodaySessions sessionListStore = {this.sessionListStore}/>
                    </TabPane>
                </Tabs>

                <ScheduleDrawer sessionStore = {this.sessionStore} />
            </>
        )
    }
}

export default ProgramUI
