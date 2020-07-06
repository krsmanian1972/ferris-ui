import React, { Component } from 'react';
import { observer } from 'mobx-react';

import SessionSlot from './SessionSlot';

@observer
class TodaySessions extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.sessionListStore.buildRoster();
    }

    render() {
        const roster = this.props.sessionListStore.roster;
        const slots = [];
        if (roster) {
            var index=0
            for (let [date, events] of roster) {
                slots.push(<SessionSlot key={index++} date={date} sessions={events} />);
            }
        }

        return (
            <>{slots}</>
        )
    }
}

export default TodaySessions