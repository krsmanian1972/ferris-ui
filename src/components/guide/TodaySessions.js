import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { notification, message, Result, Spin } from 'antd';

import SessionSlot from './SessionSlot';

const failureNotification = (help) => {
    const args = {
        message: 'Unable to Complete your request',
        description: help,
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class TodaySessions extends Component {
    constructor(props) {
        super(props);
    }

    /**
     * Let us re-build the roster for every 60 seconds
     */
    componentDidMount() {
        this.props.sessionListStore.buildRoster();
        this.interval = setInterval(() => this.props.sessionListStore.buildRoster(), 60 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    makeReady = async (fuzzyId) => {
        const store = this.props.sessionStore;
        await store.alterSessionState(fuzzyId, "READY");

        if (store.isError) {
            failureNotification(store.message.help);
        }
        else if (store.isDone) {
            message.success('Now, the Session is Ready.');
        }
    }

    cancelEvent = async (fuzzyId) => {
        const store = this.props.sessionStore;
        await store.alterSessionState(fuzzyId, "CANCEL");

        if (store.isError) {
            failureNotification(store.message.help);
        }
        else if (store.isDone) {
            message.success('The session is cancelled.');
        }
    }

    render() {
        const listStore = this.props.sessionListStore;

        if (listStore.isLoading) {
            return (
                <div className="loading-container"><Spin /></div>
            )
        }

        if (listStore.isError) {
            return (
                <Result status="warning" title={listStore.message.help} />
            )
        }

        return (this.renderSlots());
    }

    renderSlots = () => {
        const roster = this.props.sessionListStore.roster;
        const slots = [];
        if (roster) {
            var index = 0
            for (let [date, events] of roster) {
                slots.push(<SessionSlot key={index++} date={date} sessions={events} makeReady={this.makeReady} cancelEvent={this.cancelEvent} />);
            }
        }

        return (
            <>{slots}</>
        )
    }
}

export default TodaySessions