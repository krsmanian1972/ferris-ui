import React from 'react';

function SessionSlot({ date, sessions }) {

    const dateOf = (date) => {
        return date.format("DD-MMM");
    }
    const timeOf = (date) => {
        return date.format("hh A");
    }

    const people = (event) => {
        const str = `${event.coach} and ${event.actor}`;
        return <p style={{ float: 'left' }}>{str}</p>
    }

    const bandText = (band) => {
        band = band.toUpperCase();

        if(band === "OVERDUE") {
            return <p style={{ fontSize: "9px", float: 'right', color:'red'}}>{band}</p>
        }

        return <p style={{ fontSize: "9px", float: 'right'}}>{band}</p>
    }

    return (
        <div className="slot">
            <div className="slot-hour">
                <p style={{ fontWeight: "bold", marginBottom: '3px' }}>{timeOf(date)}</p>
                <p style={{ fontSize: "12px" }}>{dateOf(date)}</p>
            </div>
            <div className="slot-detail">
                {
                    sessions.map((event, index) =>
                        <div key={index} className={"slot-item " + event.band}>
                            <div className="slot-title">
                                {people(event)}
                                {bandText(event.band)}
                            </div>
                            <p>{event.sessionDetail}</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SessionSlot;