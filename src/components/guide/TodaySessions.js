import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import SessionSlot from './SessionSlot';
import { sessionStore } from '../stores/SessionStore';

const SLOT_SIZE = 36;

@inject("appStore")
@observer
class TodaySessions extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        sessionStore.buildRoster();
    }

    render() {

        const roster = sessionStore.roster;
        const slots = [];
        var index=0
        if (roster) {
            for (let [date, events] of roster) {
                slots.push(<SessionSlot key={index++} date={date} sessions={events} />);
            }
        }

        return (
            <>{slots}</>
        )
    }

    testSpan = () => {
        return (
            <div className="container">

                <div className="slot">
                    <div className="slot-hour">
                        <div style={{ fontWeight: "bold", height: "70%", display: "flex", alignItems: "center", justifyContent: "center" }}>99:99 pm</div>
                        <div style={{ fontWeight: "normal", height: "30%", display: "flex", alignItems: "center", justifyContent: "center" }}>31-Jul</div>
                    </div>
                    <div className="slot-detail">
                        <div className="slot-item">
                            <p style={{ fontWeight: "bold", marginBottom: '3px' }}>Gopal and Raja</p>
                            <p style={{ margin: '2px' }}>Session on Traits. This is the second session on this subject.</p>
                        </div>
                        <div className="slot-item">
                            <p style={{ fontWeight: "bold", marginBottom: '3px' }}>Gopal and Raja</p>
                            <p style={{ margin: '2px' }}>Session on Traits. This is the second session on this subject.</p>
                        </div>
                    </div>
                </div>

                <div className="slot">
                    <div className="slot-hour">
                        <div style={{ fontWeight: "bold", height: "70%", display: "flex", alignItems: "center", justifyContent: "center" }}>99:99 pm</div>
                        <div style={{ fontWeight: "normal", height: "30%", display: "flex", alignItems: "center", justifyContent: "center" }}>31-Jul</div>
                    </div>
                    <div className="slot-detail">
                    </div>
                </div>

                <div className="slot">
                    <div className="slot-hour">
                        <div style={{ fontWeight: "bold", height: "70%", display: "flex", alignItems: "center", justifyContent: "center" }}>99:99 pm</div>
                        <div style={{ fontWeight: "normal", height: "30%", display: "flex", alignItems: "center", justifyContent: "center" }}>31-Jul</div>
                    </div>
                    <div className="slot-detail">
                        <div className="slot-item">
                            <p style={{ fontWeight: "bold", marginBottom: '3px' }}>Gopal and Raja</p>
                            <p style={{ margin: '2px' }}>Session on Traits. This is the second session on this subject.</p>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default TodaySessions