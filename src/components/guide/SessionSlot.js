import React from 'react';
import moment from 'moment';

function SessionSlot({ date, sessions, showSessionDetail }) {

    const isCurrentHour = () => {
        const now = moment();
        const now_string = now.format("DD-MMM-YYYY")+"-"+now.format("HH");
        const date_string = date.format("DD-MMM-YYYY")+"-"+date.format("HH");
        if (now_string === date_string) {
            return "current";
        }
        return "";
    }

    const dateOf = (date) => {
        return date.format("DD-MMM");
    }

    const timeOf = (date) => {
        return date.format("hh A");
    }

    const people = (event) => {
        return <p style={{ float: 'left' }}>{event.program.name}::{event.session.people}</p>
    }

    const bandText = (band) => {
        band = band.toUpperCase();

        if (band === "OVERDUE") {
            return <p style={{ fontSize: "9px", float: 'right', color: 'red' }}>{band}</p>
        }

        return <p style={{ fontSize: "9px", float: 'right' }}>{band}</p>
    }

    return (
        <div className="slot">
            <div className={"slot-hour " + isCurrentHour()} >
                <p style={{ fontWeight: "bold", marginBottom: '3px' }}>{timeOf(date)}</p>
                <p style={{ fontSize: "12px" }}>{dateOf(date)}</p>
            </div>
            <div className="slot-detail">
                {
                    sessions.map((event, index) =>
                        <div key={index} className={"slot-item " + event.session.band} onClick = {()=>showSessionDetail(event)}>
                            <div className="slot-title">
                                {people(event)}
                                {bandText(event.session.band)}
                            </div>
                            <div>
                                <p style={{ float: 'left' }}>{event.session.description}</p>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SessionSlot;