import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import socket from './chat/socket';
import PeerConnection from './chat/PeerConnection';

import SessionInitiator from './chat/SessionInitiator';
import VideoBoard from './chat/VideoBoard';
import Invitation from './chat/Invitation';


import { Tag, Card, Row, Col, Space } from 'antd';
import { message, Input, notification, Button, Tooltip } from 'antd';
import { ShareAltOutlined, IdcardOutlined } from '@ant-design/icons';


const { Search } = Input;

@inject("appStore")
@observer
class Broadcast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myId: '',

            screenStatus:'',

            peerRequestStatus: '',
            invitationFrom: '',
            peerId: '',

            localSrc: null,
            peerSrc: null,
            screenSrc: null,
        };
        this.pc = {};
        this.config = null;
        this.firstFlag=true,
        this.peerStreamStatus = '';

        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);
    }

    obtainToken = (e) => {
        e.preventDefault();
        socket
            .on('token', ({ id: myId }) => {
                message.success(`Your Token ID is ${myId}`, 5);
                this.setState({ myId });
            })
            .on('request', ({ from: invitationFrom }) => {
                message.info(`Call from ${invitationFrom}`, 5)
                this.setState({ peerRequestStatus: 'active', invitationFrom });
            })
            .on('call', (data) => {
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
        if(peerId.trim() == this.state.myId.trim()) {
            notification["error"]({
                message: 'Talking to Self',
                description:
                  'My precious, remembers Gollum of The Lord of the Rings !!!. You have entered your own Token ID, instead of your Peer\'s Token ID. Please enter your Peer\'s Token ID.',
            })
            return;    
        }
        const config = { audio: true, video: true };
        if (peerId) {
            this.startCall(true, peerId, config);
        }
    }

    /**
     * To Start a call with the Peer
     */
    startCall = (isCaller, peerId, config) => {
        this.config = config;
        this.pc = new PeerConnection(peerId)
            .on('localStream', (src) => {
                const newState = { peerId: peerId, localSrc: src };
                if (!isCaller) {
                    newState.peerRequestStatus = '';
                }
                this.setState(newState);
            })
            .on('peerStream', (src) => {
                if (this.peerStreamStatus==='active') {
                    const newState = { screenStatus: 'active', screenSrc: src };
                    this.setState(newState);
                }
                else {
                    this.peerStreamStatus='active';
                    const newState = { peerSrc: src };
                    this.setState(newState);
                }
                
            })
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

    shareScreen = () => {
        this.pc.mediaDevice.shareScreen();
    }

    render() {
        const { myId, peerId, invitationFrom, screenStatus,peerRequestStatus, localSrc, peerSrc, screenSrc } = this.state;

        return (
            <Card title="Session - Traits in RUST">
                <SessionInitiator myId={myId} peerId={peerId} peerStreamStatus={this.peerStreamStatus} obtainToken={this.obtainToken} callPeer={this.callPeer} shareScreen={this.shareScreen} />
                <VideoBoard screenStatus={screenStatus} localSrc={localSrc} peerSrc={peerSrc} screenSrc={screenSrc} />
                <Invitation status={peerRequestStatus} startCall={this.startCallHandler} rejectCall={this.rejectCallHandler} invitationFrom={invitationFrom} />
            </Card>
        )
    }
}
export default Broadcast