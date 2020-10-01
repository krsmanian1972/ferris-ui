import React from 'react';
import moment from 'moment';

function MemberSlot({ email, details,showMemberSessions }) {

    const memberName = details.length > 0 ? details[0].user.name : "Unknown";

    const newText = (isNew) => {
        if (isNew == true) {
            return <p style={{ fontSize: "10px", float: 'right', color: 'blue' }}>New</p>
        }
    }

    const enrolledOn = (date) => {
        const localeDate = moment(date * 1000).format("DD-MMM-YYYY");
        return <p style={{ fontSize: "10px", float: 'right'}}>Enrolled on {localeDate}</p>
    }

    const renderProgram = (item, index) => {
        return (
            <div key={index} className="slot-member-item " onClick={() => showMemberSessions(item)}>
                <div className="slot-title">
                    <p style={{ float: 'left' }}>{item.program.name}</p>
                    {newText(item.enrollment.isNew)}
                </div>
                <div>
                    {enrolledOn(item.enrollment.createdAt)}
                </div>
            </div>
        )
    }

    const renderDetails = (details) => {
        return (
            <div className="slot-member-detail">
                {
                    details.map((item, index) => {
                        return renderProgram(item, index)
                    })
                }
            </div>
        )
    }

    return (
        <div className="slot">
            <div className={"slot-member"} >
                <p style={{ fontWeight: "bold", marginBottom: '3px' }}>{memberName}</p>
                <p style={{ fontSize: "12px" }}>{email}</p>
            </div>
            {renderDetails(details)}
        </div>
    )
}

export default MemberSlot;