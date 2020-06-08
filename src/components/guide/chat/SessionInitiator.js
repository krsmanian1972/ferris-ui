import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { Tag, Row, Col, Space } from 'antd';
import { message, Input, Button, Tooltip } from 'antd';
import { ShareAltOutlined, IdcardOutlined } from '@ant-design/icons';

const { Search } = Input;

function SessionInitiator({ myId, peerId, peerStreamStatus, obtainToken, callPeer, shareScreen }) {
    const isReady = myId.length > 0;

    const beforeToken = () => {
        return (
            <Row>
                <Col span={22}>
                    <Tooltip title="By clicking here; you will get a Token ID to communicate with your audience.">
                        <Button id="idCard" onClick={obtainToken} type="primary" icon={<IdcardOutlined />} shape="circle" />
                    </Tooltip>
                </Col>
            </Row>
        )
    }

    const afterToken = () => {
        return (
            <Row>
                <Col span={20}>
                    <Tag color="#108ee9">{myId}</Tag>
                </Col>
                <Col span={4}>
                    <Tooltip title="Enter your Peer's Token ID, if you know it. Soon we will provide the list of Peers to select from. Thanks !">
                        <Search placeholder="Your Peer's Token ID" enterButton="Call" size="small" onSearch={value => callPeer(value)} />
                    </Tooltip>    
                </Col>
            </Row>
        )
    }

    const enterCall = () => {
        const canShare = peerStreamStatus === "active";

        return (
            <Row>
                <Col span={20}>
                    <Space>
                        <Tag color="#108ee9">{myId}</Tag>
                        <Tooltip title="Share Screen">
                            <Button onClick={shareScreen} disabled={!canShare} id="screenShare" type="primary" icon={<ShareAltOutlined />} shape="circle" />
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={4} style={{ textAlign: "right" }}>
                    <Tag color="#87d068">{peerId}</Tag>
                </Col>
            </Row>
        )
    }

    const evalControl = () => {
        let row;

        if (peerId.length > 0) {
            row = enterCall();
        }
        else {
            row = isReady ? afterToken() : beforeToken();
        }

        return row;
    }

    return (
        <>
            {evalControl()}
        </>
    )
}

SessionInitiator.propTypes = {
    myId: PropTypes.string.isRequired,
    peerId: PropTypes.string.isRequired,
    peerStreamStatus: PropTypes.string.isRequired,
    obtainToken: PropTypes.func.isRequired,
    callPeer: PropTypes.func.isRequired,
    shareScreen: PropTypes.func.isRequired,
};

export default SessionInitiator;