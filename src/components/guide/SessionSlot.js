import React from 'react';
import moment from 'moment';

function SessionSlot({ date, sessions, showSessionDetail }) {

    const isCurrentHour = () => {
        const now = moment();
        const now_string = now.format("DD-MMM-YYYY") + "-" + now.format("HH");
        const date_string = date.format("DD-MMM-YYYY") + "-" + date.format("HH");
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
        return <p style={{ float: 'left', width:"33.3%" }}>{event.program.name}::{event.session.people}</p>
    }

    const bandText = (band) => {
        band = band.toUpperCase();

        if (band === "OVERDUE") {
            return <p style={{ fontSize: "9px", float: 'right', color: 'red' }}>{band}</p>
        }

        return <p style={{ fontSize: "9px", float: 'right' }}>{band}</p>
    }

    const renderSession = (event, index) => {
        return (
            <div className="slot-detail">
                <div key={index} className={"slot-item " + event.session.band} onClick={() => showSessionDetail(event)}>
                    <div className="slot-title">
                        {people(event)}
                        <p style={{fontSize: "10px",width:"33.3%"}}>SESSION</p>
                        {bandText(event.session.band)}
                    </div>
                    <div>
                        <p style={{ float: 'left' }}>{event.session.description}</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderObjective = (event, index) => {
        return (
            <div key={index} className={"slot-item "}>
                <div className="slot-title">
                    <p style={{ float: 'left' }}>{event.program.name}::{event.program.coachName}</p>
                    <p>Objective</p>
                    {bandText(event.objective.status)}
                </div>
                <div>
                    <p style={{ float: 'left' }}>{event.objective.description}</p>
                </div>
            </div>
        )
    }

    const renderTask = (event, index) => {
        return (
            <div className="slot-detail">
                <div key={index} className={"slot-item task"}>
                    <div className="slot-title">
                        <p style={{width:"33.3%"}}>{event.program.name}</p>
                        <p style={{fontSize: "10px", width:"33.3%"}}>TASK</p>
                        {bandText(event.task.status)}
                    </div>
                    <div>
                        <p style={{ float: 'left' }}>{event.task.name}</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderDetail = (sessions) => {
        console.log(sessions.length);
        if(sessions.length === 0) {
            return ( 
                <div className="slot-detail"></div>
            )
        }

        return (
            sessions.map((event, index) => {
                if (event.session) {
                    return renderSession(event, index)
                }
                else if (event.task) {
                    return renderTask(event, index)
                }
            })
        )
    }

    return (
        <div className="slot">
            <div className={"slot-hour " + isCurrentHour()} >
                <p style={{ fontWeight: "bold", marginBottom: '3px' }}>{timeOf(date)}</p>
                <p style={{ fontSize: "12px" }}>{dateOf(date)}</p>
            </div>
            {renderDetail(sessions)}
        </div>
    )
}

export default SessionSlot;