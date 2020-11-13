import React from 'react';
import moment from 'moment';

function DigestSlot({ email, details,showJournalUI }) {

    const senderName = details.length > 0 ? details[0].user.name : "Unknown";

    const createdOn = (date) => {
        const localeDate = moment(date * 1000).format("DD-MMM-YYYY");
        return <p style={{ fontSize: "10px", float: 'right'}}>{localeDate}</p>
    }

    const renderFeed = (feed, description, index) => {
        return (
            <div key={index} className="slot-member-item " onClick={() => showJournalUI(feed)}>
                <div className="digest">
                    <p style={{ fontWeight: "bold", fontSize: "10px", marginBottom: "5px", color: 'blue' }} >{feed.programName}</p>
                    <p>{description}</p>
                </div>
                <div>
                    {createdOn(feed.createdAt)}
                </div>
            </div>
        )
    }

    const renderDetails = (details) => {
        return (
            <div className="slot-member-detail">
                {
                    details.map((item, index) => {
                        return renderFeed(item.feed, item.description, index)
                    })
                }
            </div>
        )
    }

    return (
        <div className="slot">
            <div className={"slot-member"} >
                <p style={{ fontWeight: "bold", marginBottom: '3px' }}>{senderName}</p>
                <p style={{ fontSize: "12px" }}>{email}</p>
            </div>
            {renderDetails(details)}
        </div>
    )
}

export default DigestSlot;