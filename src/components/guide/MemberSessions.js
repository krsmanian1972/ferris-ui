import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Typography, Tag } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import ProgramSessionSlot from '../commons/ProgramSessionSlot';

const { Text } = Typography;

@observer
class MemberSessions extends Component {

    constructor(props) {
        super(props);
    }

    getTitle = () => {
        return (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}>
                Sessions&nbsp;{this.countTag()}
            </div>
        )
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
                        subTitle={<Text style={{color:"blue"}}>Please select the program of an enrolled member.</Text>} />
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
            <div style={{ width: "50%", marginRight: "10px" }}>
                <div style={{ background: "rgb(59,109,171)", marginBottom: "6px", color: "white", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                    {this.getTitle()}
                </div>
                {this.displayMessage()}
                {this.renderSlots(sessions)}
            </div>
        )

    }

}
export default MemberSessions;