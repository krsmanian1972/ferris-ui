import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Card, Spin, Result, Typography, Tag } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import ProgramSessionSlot from '../commons/ProgramSessionSlot';

const { Text } = Typography;
const { Title } = Typography;

@observer
class MemberSessions extends Component {

    constructor(props) {
        super(props);
    }

    countTag = () => {
        if (this.props.store.isDone) {
            return <Tag color="#108ee9">{this.props.store.rowCount} Total</Tag>
        }

        if (this.props.store.isError) {
            return <Tag color="red">...</Tag>
        }
    }

    displayMessage = () => {
        const store = this.props.store;

        if (store.isInit) {
            return (
                <Result
                    icon={<SmileOutlined />}
                    subTitle={<Text>Please select the program of an enrolled member.</Text>} />
            )
        }
        if (store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (store.isError) {
            return (
                <Result status="warning" title={store.message.help} />
            )
        }

        return (<></>)
    }

    renderSlots = (sessions) => {
        const slots = [];
        if (sessions) {
            var index = 0
            for (let [date, events] of sessions) {
                slots.push(<ProgramSessionSlot key={index++} date={date} sessions={events} showSessionDetail={this.props.showSessionDetail} />);
            }
        }

        return (
            <div>{slots}</div>
        )
    }

    render() {

        const sessions = this.props.store.sessions;

        return (
            <Card 
                headStyle={{background:"#fafafa",borderBottom:"1px solid", borderColor: "rgb(216,213,221)", borderRadius:"12px 12px 0px 0px"}} style={{ marginTop: "10px", borderRadius:"12px" }} title={<Title level={4}>Sessions {this.countTag()}</Title>}>
                {this.displayMessage()}
                {this.renderSlots(sessions)}
            </Card>
        )
    }

}
export default MemberSessions;