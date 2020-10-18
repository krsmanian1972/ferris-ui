import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Result, Spin } from 'antd';

import SessionSlot from './SessionSlot';


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
                slots.push(<SessionSlot key={index++} date={date} sessions={events} showSessionDetail={this.props.showSessionDetail}/>);
            }
        }

        return (
            <>{slots}</>
        )
    }
}

export default TodaySessions
