import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import socket from './chat/socket';
import PeerConnection from './chat/PeerConnection';

import SessionInitiator from './chat/SessionInitiator';
import VideoBoard from './chat/VideoBoard';
import Invitation from './chat/Invitation';


import { Tag, Card, Row, Col, Space } from 'antd';
import { message, Input, Button, Tooltip } from 'antd';
import { ShareAltOutlined, IdcardOutlined } from '@ant-design/icons';


const { Search } = Input;

@inject("appStore")
@observer
class Broadcast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myId: '',

            localStreamStatus: '',
            peerStreamStatus: '',

            peerRequestStatus: '',
            invitationFrom: '',
            peerId: '',

            localSrc: null,
            peerSrc: null,
            peerScreenSrc:null,
        };
        this.pc = {};
        this.config = null;

        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);
    }

    obtainToken = (e) => {
        e.preventDefault();
        socket
            .on('init', ({ id: myId }) => {
                message.success(`Your Id is ${myId}`, 5);
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
                const newState = { localStreamStatus: 'active', peerId: peerId, localSrc: src };
                if (!isCaller) {
                    newState.peerRequestStatus = '';
                }
                this.setState(newState);
            })
            .on('peerStream', (src) => {
                let newState;
                if(this.pc.mediaDevice.isScreenSharing) {
                    console.log("Yes screen Sharing on Peer Stream");
                    newState = { peerStreamStatus: 'active', peerScreenSrc: src };
                }
                else {    
                    console.log("No Screen Sharing on Peer Stream");
                    newState = { peerStreamStatus: 'active', peerSrc: src };
                }
                this.setState(newState);
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
        const { myId, peerId, invitationFrom, peerStreamStatus, peerRequestStatus, localSrc, peerSrc, peerScreenSrc } = this.state;

        return (
            <Card title="Session - Traits in RUST">
                <SessionInitiator myId={myId} peerId={peerId} peerStreamStatus={peerStreamStatus} obtainToken={this.obtainToken} callPeer={this.callPeer} shareScreen={this.shareScreen}/>
                <VideoBoard localSrc={localSrc} peerSrc={peerSrc}/>
                <Invitation status={peerRequestStatus} startCall={this.startCallHandler} rejectCall={this.rejectCallHandler} invitationFrom={invitationFrom} />
            </Card>
        )
    }
}
export default Broadcast