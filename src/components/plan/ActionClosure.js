import React from 'react';
import PropTypes from 'prop-types';


import { Button, Tooltip, Space, Popconfirm, Statistic, Typography } from 'antd';
import { CarryOutOutlined, CheckOutlined } from '@ant-design/icons';

import Reader from "../commons/Reader";

const { Title } = Typography;

const taskStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const titleBarStyle = { background: "rgb(36,39,84)", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold", color: "white" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const buttonStyle = { border: "1px solid green", color: "green" };



export default function ActionClosure({ task, index, store }) {

    const showEditClosingNotes = () => {
        const flag = store.asCurrent(index);
        store.showClosureDrawer = flag;
    }

    const closeActivity = () => {
        store.closeTask(index);
    }

    const closureText = () => {
        if (task.actualEnd) {
            const actualEnd = task.actualEnd.format("DD-MMM-YYYY");

            const title = <Title level={5} style={{ fontSize: "10px", color: "white", textAlign: "right" }}>Closed on</Title>

            return (
                <Statistic title={title} value={actualEnd} valueStyle={{ fontSize: "12px", fontWeight: "bold", color: "white" }} />
            )
        }
    }

    const draftButton = () => {
        if (store.isCoach && task.canComplete) {
            return (
                <Tooltip key="draft_close_tip" title="To draft your closing notes.">
                    <Button key="draft_close_but"
                        icon={<CarryOutOutlined />} shape="circle"
                        onClick={() => showEditClosingNotes()}>
                    </Button>
                </Tooltip>
            )
        }
    }

    const doneButton = () => {
        if (store.isCoach && task.canComplete) {
            return (
                <Popconfirm key="done_pc" placement="left"
                    title="Are you fine with your closing notes?"
                    okText="Yes" cancelText="No"
                    onConfirm={() => closeActivity()}>
                    <Tooltip key="done_tip" title="To mark the task as done.">
                        <Button key="done_but" style={buttonStyle} icon={<CheckOutlined />} shape="circle"></Button>
                    </Tooltip>
                </Popconfirm>
            )
        }
    }


    const getControls = () => {
        return (
            <div style={controlStyle}>
                <Space>
                    {draftButton()}
                    {doneButton()}
                    {closureText()}
                </Space>
            </div>
        );
    }

    const renderTitle = () => {
        return (
            <div style={titleBarStyle}>
                <div style={titleStyle}>Coach Closure Notes</div>
                {getControls()}
            </div>
        )
    }

    return (
        <>
            {renderTitle()}
            <div style={taskStyle}>
                <Reader value={task.closingNotes} readOnly={true} height={350} />
            </div>
        </>
    )
};

ActionClosure.propTypes = {
    task: PropTypes.object,
    index: PropTypes.number,
    store: PropTypes.object,
};

