import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs } from 'antd';
import { HistoryOutlined, ThunderboltOutlined, CalendarOutlined } from '@ant-design/icons';
import SessionDetail from './SessionDetail';

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

                <Tabs defaultActiveKey="1" tabPosition="left" style={{ minHeight: 400}}>
                    <TabPane key="1" tab={<span><ThunderboltOutlined/>Current</span>}>
                        <SessionDetail id={1}/>
                    </TabPane>

                    <TabPane key="2" tab={<span><CalendarOutlined/>Next</span>}>
                        
                    </TabPane>

                    <TabPane key="3" tab={<span><HistoryOutlined/>Past</span>}>
                        
                    </TabPane>
                </Tabs>               
            </>
        )
    }
}

export default ProgramUI
