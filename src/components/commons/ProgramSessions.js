import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Typography, Tag } from 'antd';

import SessionListStore from '../stores/SessionListStore';

import SessionSlot from './SessionSlot';

const { Title } = Typography;

@observer
class ProgramSession extends Component {

    constructor(props) {
        super(props);
        this.store = new SessionListStore({ apiProxy: props.apiProxy });
        this.store.fetchProgramSession(props.programId);
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
                slots.push(<SessionSlot key={index++} date={date} sessions={events} showSessionDetail={this.props.showSessionDetail}/>);
            }
        }

        return (
            <>{slots}</>
        )
    }

    render() {

        const sessions = this.store.sessions;
        
        return (
            <div style={{ marginTop: 20 }}>
                <Title level={4}>{this.props.title} {this.countTag()}</Title>
                {this.displayMessage()}
                {this.renderSlots(sessions)}
            </div>
        )
    }

}
export default ProgramSession;