import React from 'react';
import PropTypes from 'prop-types';

import { Tag, Space } from 'antd';
import { Button, Tooltip } from 'antd';

import { VideoCameraOutlined,AudioOutlined,StopOutlined } from '@ant-design/icons';

function Invitation({ status, invitationFrom, joinCall, rejectCall }) {
    
    const acceptWithVideo = (video) => {
        const config = { audio: true, video };
        return () => joinCall(invitationFrom,config);
    };

    var stageStyle = {display: "none"};
    var isReady = false;
    
    if (status === "active") {
        stageStyle.display = "block";
        isReady = true;
    }
    else {
        isReady = false;
    }

    const callerName = invitationFrom.split('~')[1];

    return (

        <div style={stageStyle}>
            <Space>
                <Tag color="#108ee9">{`${callerName} is calling`}</Tag>
                <Tooltip title="Join as video call">
                    <Button disabled={!isReady} id="video_call" onClick={acceptWithVideo(true)} type="primary" icon={<VideoCameraOutlined />} shape="circle" />
                </Tooltip>
                <Tooltip title="Join as audio call">
                    <Button disabled={!isReady} id="audio_call" onClick={acceptWithVideo(false)} type="primary" icon={<AudioOutlined />} shape="circle" />
                </Tooltip>
                <Tooltip title="Decline the call">
                    <Button disabled={!isReady} id="decline_call" onClick={rejectCall} type="primary" danger icon={<StopOutlined />} shape="circle" />
                </Tooltip>
            </Space>
        </div>
    );
}

Invitation.propTypes = {
    status: PropTypes.string.isRequired,
    invitationFrom: PropTypes.string.isRequired,
    joinCall: PropTypes.func.isRequired,
    rejectCall: PropTypes.func.isRequired
};

export default Invitation;
