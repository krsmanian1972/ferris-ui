import React from 'react';

import { Button, Space, Popconfirm } from 'antd';
import { CaretRightOutlined, CloseOutlined } from '@ant-design/icons';

function SessionSlot({ date, sessions, makeReady, cancelEvent }) {

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

    const makeReadyButton = (session) => {
        if (session.status !== "READY") {
            return (
                <Popconfirm placement="left" title="Mark this session as Ready?" okText="Yes" cancelText="No"
                    onConfirm={() => makeReady(session.fuzzyId)}
                >
                    <Button key="ready" style={{ border: "1px solid green", color: "green" }} icon={<CaretRightOutlined />} shape="circle"></Button>
                </Popconfirm>
            )
        }
    }

    const cancelEventButton = (session) => {
        return (
            <Popconfirm placement="left" title="Mark this session as Cancelled?" okText="Yes" cancelText="No"
                onConfirm={() => cancelEvent(session.fuzzyId)}
            >
                <Button key="cancel" danger icon={<CloseOutlined />} shape="circle"></Button>
            </Popconfirm>
        )
    }

    const controls = (session) => {
        if (session.isClosed) {
            return <></>
        }

        return (
            <Space>
                {makeReadyButton(session)}
                {cancelEventButton(session)}
            </Space>
        )
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
                        <div key={index} className={"slot-item " + event.session.band}>
                            <div className="slot-title">
                                {people(event)}
                                {bandText(event.session.band)}
                            </div>
                            <div>
                                <p style={{ float: 'left' }}>{event.session.description}</p>
                                <div style={{ float: 'right' }}>{controls(event.session)}</div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SessionSlot;