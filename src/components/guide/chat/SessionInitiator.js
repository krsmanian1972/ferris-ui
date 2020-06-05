import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { Tag, Row, Col, Space } from 'antd';
import { message, Input, Button, Tooltip } from 'antd';
import { ShareAltOutlined, IdcardOutlined } from '@ant-design/icons';

const { Search } = Input;

function SessionInitiator({ myId, peerId, peerStreamStatus, obtainToken,callPeer,shareScreen }) {
    const isReady = myId.length > 0;

    const beforeToken = () => {
        return (
            <Row>
                <Col span={22}>
                    <Space>
                        <Tooltip title="By clicking here; you will get a Token to communicate with your audiance.">
                            <Button id="idCard" onClick={obtainToken} type="primary" icon={<IdcardOutlined />} shape="circle" />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
        )
    }

    const afterToken = () => {
        return (
            <Row>
                <Col span={20}>
                    <Space>
                        <Tag color="#108ee9">{myId}</Tag>
                    </Space>
                </Col>
                <Col span={4}>
                    <Space>
                        <Search placeholder="Your Peer's Id" enterButton="Call" size="small" onSearch={value => callPeer(value)} />
                    </Space>
                </Col>
            </Row>
        )
    }

    const enterCall = () => {
        const canShare = peerStreamStatus==="active";

        return (
            <Row>
                <Col span={20}>
                    <Space>
                        <Tag color="#108ee9">{myId}</Tag>
                    </Space>
                </Col>
                <Col span={4}>
                    <Space>
                        <Tag color="#87d068">{peerId}</Tag>
                        <Tooltip title="Share Screen">
                            <Button onClick={shareScreen} disabled={!canShare} id="screenShare" type="primary" icon={<ShareAltOutlined />} shape="circle" />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
        )
    }

    const evalControl = () => {
        let row;

        if (peerId.length > 0) {
            row = enterCall();
        }
        else
        { 
            row = isReady ? afterToken() : beforeToken();
        }

        return row;
    }

    return (
        <>
            { evalControl() }
        </>
    )
}

SessionInitiator.propTypes = {
    myId: PropTypes.string.isRequired,
    peerId: PropTypes.string.isRequired,
    peerStreamStatus:PropTypes.string.isRequired, 
    obtainToken: PropTypes.func.isRequired,
    callPeer: PropTypes.func.isRequired,
    shareScreen: PropTypes.func.isRequired,
};

export default SessionInitiator;