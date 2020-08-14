import React from 'react';

export default function ProgramSessionSlot({ date, sessions, showSessionDetail }) {

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
            <div className="slot-hour">
                <p style={{ fontWeight: "bold", marginBottom: '3px' }}>{date}</p>
            </div>
            <div className="slot-detail">
                {
                    sessions.map((event, index) =>
                        <div key={index} className={"slot-item " + event.session.band} onClick = {()=>showSessionDetail(event)}>
                            <div className="slot-title">
                                {people(event)}
                                {bandText(event.session.status)}
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