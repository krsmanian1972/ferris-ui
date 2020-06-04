import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import socket from './chat/socket';
import PeerConnection from './chat/PeerConnection';
import VideoBoard from './chat/VideoBoard';
import Invitation from './chat/Invitation';


import { Tag, Card, Row, Col, Space } from 'antd';
import { message, Input, Button, Tooltip } from 'antd';
import { ShareAltOutlined, IdcardOutlined} from '@ant-design/icons';


const { Search } = Input;

@inject("appStore")
@observer
class Broadcast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myId: '',

            localStreamStatus: '',
            peerRequestStatus: '',
            invitationFrom: '',

            localSrc: null,
            peerSrc: null
        };
        this.pc = {};
        this.config = null;

        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);
    }

    readyForChat = (key, e) => {
        e.preventDefault();
        socket
            .on('init', ({ id: myId }) => {
                message.success(`Your Id is ${myId}`, 5);
                this.setState({ myId });
            })
            .on('request', ({ from: invitationFrom }) => {
                message.info(`Call from ${invitationFrom}`, 5)
                console.log("request");
                this.setState({ peerRequestStatus: 'active', invitationFrom });
            })
            .on('call', (data) => {
                console.log("call");
                if (data.sdp) {
                    this.pc.setRemoteDescription(data.sdp);
                    if (data.sdp.type === 'offer') {
                        this.pc.createAnswer();
                    }
                }
                else {
                    this.pc.addIceCandidate(data.candidate);
                }
            })
            .on('end', this.endCall.bind(this, false))
            .emit('init');
    }

    callPeer = (peerId) => {
        const config = { audio: true, video: true };
        console.log("Peer Id");
        console.log(peerId);
        if (peerId) {
            this.startCall(true, peerId, config);
        }
    }

    startCall = (isCaller, peerId, config) => {
        console.log("Starting call with the Peer");
        this.config = config;
        this.pc = new PeerConnection(peerId)
            .on('localStream', (src) => {
                const newState = { localStreamStatus: 'active', localSrc: src };
                if (!isCaller) {
                    newState.peerRequestStatus = '';
                }
                this.setState(newState);
            })
            .on('peerStream', (src) => this.setState({ peerSrc: src }))
            .start(isCaller, config);
    }

    rejectCall() {
        const { invitationFrom } = this.state;
        socket.emit('end', { to: invitationFrom });
        this.setState({ peerRequestStatus: '' });
    }

    endCall(isStarter) {
        console.log("end Call");
        if (_.isFunction(this.pc.stop)) {
            this.pc.stop(isStarter);
        }
        this.pc = {};
        this.config = null;
        this.setState({
            localStreamStatus: '',
            peerRequestStatus: '',
            localSrc: null,
            peerSrc: null
        });
    }

    _session_initiator = () => {
        const { myId } = this.state;
        const isReady = myId.length > 0;
        return (
            <Row>
                <Col span={16}>
                    <Space>
                        <Tag color="#108ee9">{myId}</Tag>
                        <Tooltip title="Obtain an Id">
                            <Button disabled={isReady} id="idCard" onClick={(e) => this.readyForChat("ready", e)} type="primary" icon={<IdcardOutlined />} shape="circle" />
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={6}>
                    <Space>
                        <Search disabled={!isReady} placeholder="Your Peer's Id" enterButton="Call" size="small" onSearch={value => this.callPeer(value)} />
                        <Tooltip title="Share Screen">
                            <Button disabled={!isReady} id="book" type="primary" icon={<ShareAltOutlined />} shape="circle" />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
        )
    }
    render() {
        const { invitationFrom, peerRequestStatus, localSrc, peerSrc } = this.state;

        return (
            <Card title="Session - Traits in RUST">
                {this._session_initiator()}
                <VideoBoard localSrc={localSrc} peerSrc={peerSrc} />
                <Invitation status={peerRequestStatus} startCall={this.startCallHandler} rejectCall={this.rejectCallHandler} invitationFrom={invitationFrom} />
            </Card>
        )
    }
}
export default Broadcast