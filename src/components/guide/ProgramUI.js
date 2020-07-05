import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs } from 'antd';
import { HistoryOutlined, ThunderboltOutlined, CalendarOutlined, HourglassOutlined } from '@ant-design/icons';
import SessionDetail from './SessionDetail';
import TodaySessions from './TodaySessions';

const { TabPane } = Tabs;

@inject("appStore")
@observer
class ProgramUI extends Component {
    constructor(props) {
        super(props);
    }
  

    render() {
        return (
            <>

                <Tabs defaultActiveKey="1" tabPosition="top"  style={{ minHeight: 400}}>
                    <TabPane key="1" tab={<span><ThunderboltOutlined/>Current</span>}>
                        <SessionDetail sessionId={24}/>
                    </TabPane>

                    <TabPane key="2" tab={<span><HourglassOutlined/>Today</span>}>
                        <TodaySessions/>
                    </TabPane>

                    <TabPane key="3" tab={<span><CalendarOutlined/>Next</span>}>
                        <TodaySessions />
                    </TabPane>

                    <TabPane key="4" tab={<span><HistoryOutlined/>Past</span>}>
                        
                    </TabPane>
                </Tabs>               
            </>
        )
    }
}

export default ProgramUI
