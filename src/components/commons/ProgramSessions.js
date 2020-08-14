import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Card, Result, Typography, Tag } from 'antd';

import SessionListStore from '../stores/SessionListStore';

import ProgramSessionSlot from './ProgramSessionSlot';

const { Title } = Typography;

@observer
class ProgramSession extends Component {

    constructor(props) {
        super(props);
        this.store = new SessionListStore({ apiProxy: props.apiProxy });
        this.store.fetchProgramSessions(props.programId);
    }
    countTag = () => {
        if (this.store.isDone) {
            return <Tag color="#108ee9">{this.store.rowCount} Total</Tag>
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }
    }

    displayMessage = () => {
        const store = this.store;

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
            <>{slots}</>
        )
    }

    render() {

        const sessions = this.store.sessions;

        return (
            <Card title={<Title level={4}>Your Sessions {this.countTag()}</Title>}>
                {this.displayMessage()}
                {this.renderSlots(sessions)}
            </Card>
        )
    }

}
export default ProgramSession;