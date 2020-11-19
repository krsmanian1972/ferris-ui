import React from 'react';
import PropTypes from 'prop-types';


import { Button, Tooltip, Space, Popconfirm, Statistic,Typography } from 'antd';
import { CaretRightOutlined, CarryOutOutlined, CheckOutlined } from '@ant-design/icons';

import Reader from "../commons/Reader";

const {Title} = Typography;

const taskStyle = { background: "rgb(242,242,242)", width: "100%", marginBottom: "10px" };
const titleBarStyle = { background: "rgb(189,229,207)", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" };
const titleStyle = { display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" };
const controlStyle = { display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 };
const buttonStyle = { border: "1px solid green", color: "green" };

export default function ActionResponse({ task, index, store }) {

    const startActivity = () => {
        store.startTask(index);
    }

    const showEditResponse = () => {
        const flag = store.asCurrent(index);
        store.showResponseDrawer = flag;
    }

    const finishActivity = () => {
        store.finishTask(index);
    }

    const respondedText = () => {
        if (task.respondedDate) {
            const respondedDate = task.respondedDate.format("DD-MMM-YYYY");
            const title = <Title level={5} style={{ fontSize: "10px",color:"black",textAlign:"right" }}>Responded on</Title>

            return (
                <Statistic title={title} value={respondedDate} valueStyle={{ fontSize: "12px", fontWeight: "bold" }} />
            )
        }
    }

    const draftResponseButton = () => {
        if (!store.isCoach && task.canRespond) {
            return (
                <Tooltip key="ed_resp_tip" title="To draft your response.">
                    <Button key="edit_resp"
                        icon={<CarryOutOutlined />} shape="circle"
                        onClick={() => showEditResponse()}>
                    </Button>
                </Tooltip>
            )
        }
    }

    const finishActivityButton = () => {
        if (!store.isCoach && task.canFinish) {
            return (
                <Popconfirm key="finish_act" placement="left"
                    title="Mark this activity as finished?"
                    okText="Yes" cancelText="No"
                    onConfirm={() => finishActivity()}>
                    <Tooltip key="finish_tip" title="To mark the task as finished.">
                        <Button key="finish_but" style={buttonStyle} icon={<CheckOutlined />} shape="circle"></Button>
                    </Tooltip>
                </Popconfirm>
            )
        }
    }

    const startActivityButton = () => {
        if (!store.isCoach && task.canStart) {
            return (
                <Popconfirm key="start_act" placement="left"
                    title="Start this activity?"
                    okText="Yes" cancelText="No"
                    onConfirm={() => startActivity()}>
                    <Tooltip key="start_tip" title="Start the task to write your response.">
                        <Button key="start_but" style={buttonStyle} icon={<CaretRightOutlined />} shape="circle"></Button>
                    </Tooltip>
                </Popconfirm>
            )
        }
    }

    const getControls = () => {
        return (
            <div style={controlStyle}>
                <Space>
                    {startActivityButton()}
                    {draftResponseButton()}
                    {finishActivityButton()}
                    {respondedText()}
                </Space>
            </div>
        );
    }

    const renderTitle = () => {
        return (
            <div style={titleBarStyle}>
                <div style={titleStyle}>Response</div>
                {getControls()}
            </div>
        )
    }

    return (
        <>
            {renderTitle()}
            <div style={taskStyle}>
                <Reader value={task.response} readOnly={true} height={350} />
            </div>
        </>
    )
};

ActionResponse.propTypes = {
    task: PropTypes.object,
    index: PropTypes.number,
    store: PropTypes.object,
};

