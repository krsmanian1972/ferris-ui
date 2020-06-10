import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import socket from './webrtc/socket';
import VideoStreamTransceiver from './webrtc/VideoStreamTransceiver';
import ScreenStreamTransceiver from './webrtc/ScreenStreamTransceiver';

import SessionInitiator from './SessionInitiator';
import Invitation from './Invitation';
import VideoBoard from './VideoBoard';
import ScreenBoard from './ScreenBoard';
import CurrentSessionPlan from './CurrentSessionPlan';
import BookPage from './BookPage';

import { Card,Tabs,Tooltip } from 'antd';
import { message, notification, } from 'antd';
import { CameraOutlined, DesktopOutlined, AimOutlined, BookOutlined, CodepenOutlined, EditOutlined } from '@ant-design/icons';

const CONNECTION_KEY_VIDEO_STREAM = "peerVideoStream";
const CONNECTION_KEY_SCREEN_STREAM = "peerScreenStream";

const { TabPane } = Tabs;

@inject("appStore")
@observer
class Broadcast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myId: '',

            screenStatus: '',

            peerRequestStatus: '',
            invitationFrom: '',
            peerId: '',

            localSrc: null,
            peerSrc: null,
            screenSrc: null,
        };

        this.transceivers = {};
        
        this.isCaller = false;
        this.peerStreamStatus = '';
    
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);
    }

    buildtransceivers = (peerId) => {
        this.transceivers[CONNECTION_KEY_VIDEO_STREAM] = this.buildVideotransceiver(peerId);
        this.transceivers[CONNECTION_KEY_SCREEN_STREAM] = this.buildScreentransceiver(peerId);
    }

    buildVideotransceiver = (peerId) => {
        return new VideoStreamTransceiver(peerId, CONNECTION_KEY_VIDEO_STREAM)
            .on('localStream', (src) => {
                const newState = { peerId: peerId, localSrc: src };
                if (!this.isCaller) {
                    newState.peerRequestStatus = '';
                }
                this.setState(newState);
            })
            .on(CONNECTION_KEY_VIDEO_STREAM, (src) => {
                    this.peerStreamStatus = 'active';
                    const newState = { peerSrc: src };
                    this.setState(newState);
            });
    }

    buildScreentransceiver = (peerId) => {
        return new ScreenStreamTransceiver(peerId, CONNECTION_KEY_SCREEN_STREAM)
            .on(CONNECTION_KEY_SCREEN_STREAM, (src) => {
                const newState = { screenStatus: 'active', screenSrc: src };
                this.setState(newState);
            })
    }

    handleNegotiation = (data) => {
        if (!data.connectionKey) {
            console.log("Data without connection key");
            console.log(data);
            return;
        }

        // Obtain the respective Transceiver to negotiate
        
        const transceiver = this.transceivers[data.connectionKey];

        if (data.sdp) {
            transceiver.setRemoteDescription(data.sdp);
            if (data.sdp.type === 'offer') {
                transceiver.createAnswer();
            }
        }
        else {
            transceiver.addIceCandidate(data.candidate);
        }
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
            .on('call', (data) => { this.handleNegotiation(data) })
            .on('end', this.endCall.bind(this, false))
            .emit('init');
    }

    callPeer = (peerId) => {
        if (peerId.trim() == this.state.myId.trim()) {
            notification["error"]({
                message: 'Talking to Self',
                description:
                    'My precious, remembers Gollum of The Lord of the Rings !!!. You have entered your own Token ID, instead of your Peer\'s Token ID. Please enter your Peer\'s Token ID.',
            })
            return;
        }

        this.isCaller = true;
        this.buildtransceivers(peerId);

        if (peerId) {
            this.transceivers[CONNECTION_KEY_VIDEO_STREAM].start(true);
        }
    }

    joinCall = (peerId,preference) => {
        this.isCaller = false;
        this.buildtransceivers(peerId);
        this.transceivers[CONNECTION_KEY_VIDEO_STREAM].join(preference);
    }

    shareScreen = () => {
        this.transceivers[CONNECTION_KEY_SCREEN_STREAM].start();
    }

    rejectCall() {
        const { invitationFrom } = this.state;
        socket.emit('end', { to: invitationFrom });
        this.setState({ peerRequestStatus: '' });
    }

    endCall(isStarter) {
        console.log("end Call");
        this.setState({
            localStreamStatus: '',
            peerRequestStatus: '',
            localSrc: null,
            peerSrc: null
        });
    }


    render() {
        const { myId, peerId, invitationFrom, screenStatus, peerRequestStatus, localSrc, peerSrc, screenSrc } = this.state;

        return (
            <Card title="Session - Traits in RUST">
                <Tabs defaultActiveKey="1" tabPosition="left" style={{ minHeight: 400}}>
                    <TabPane key="5"tab={<Tooltip title="Session Plan"><AimOutlined/></Tooltip>} >
                        <CurrentSessionPlan/>
                    </TabPane>    
                    <TabPane key="1" tab={<Tooltip title="Video" ><CameraOutlined /></Tooltip>}>
                        <VideoBoard screenStatus={screenStatus} localSrc={localSrc} peerSrc={peerSrc} />
                    </TabPane>
                    <TabPane key="2" tab={<Tooltip title="Screen Sharing" ><DesktopOutlined /></Tooltip>}>
                        <ScreenBoard screenStatus={screenStatus} screenSrc={screenSrc} />
                    </TabPane>
                    <TabPane key="3" tab={<Tooltip title="Writing Aid"><EditOutlined/></Tooltip>}>
                        Writtable Canvas Here
                    </TabPane>
                    <TabPane key="4" tab={<Tooltip title="References"><BookOutlined/></Tooltip>}>
                        <BookPage/>
                    </TabPane>
                </Tabs>

                <SessionInitiator myId={myId} peerId={peerId} peerStreamStatus={this.peerStreamStatus} obtainToken={this.obtainToken} callPeer={this.callPeer} shareScreen={this.shareScreen} />
                <Invitation status={peerRequestStatus} joinCall={this.joinCall} rejectCall={this.rejectCallHandler} invitationFrom={invitationFrom} />
            </Card>
        )
    }
}
export default Broadcast