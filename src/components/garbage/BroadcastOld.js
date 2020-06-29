import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import socket from '../stores/socket';
import VideoStreamTransceiver from '../webrtc/VideoStreamTransceiver';
import ScreenStreamTransceiver from '../webrtc/ScreenStreamTransceiver';

import Invitation from '../guide/Invitation';
import VideoBoard from '../guide/VideoBoard';
import ScreenBoard from '../guide/ScreenBoard';
import CurrentSessionPlan from '../guide/CurrentSessionPlan';
import BookPage from '../guide/BookPage';

import { Tabs, Button } from 'antd';
import { message, notification, } from 'antd';
import { CameraOutlined, DesktopOutlined, AimOutlined, BookOutlined, ShareAltOutlined, EditOutlined } from '@ant-design/icons';

const CONNECTION_KEY_VIDEO_STREAM = "peerVideoStream";
const CONNECTION_KEY_SCREEN_STREAM = "peerScreenStream";

const { TabPane } = Tabs;

@inject("appStore")
@observer
class Broadcast extends Component {
    constructor(props) {
        super(props);
        this.state = {

            screenStatus: '',

            peerRequestStatus: '',
            invitationFrom: '',
            peerId: '',

            localSrc: null,
            peerSrc: null,
            screenSrc: null,

            portalSize: { height: window.innerHeight, width: window.innerWidth }
        };

        this.transceivers = {};

        this.isCaller = false;
        this.peerStreamStatus = '';

        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

        this.sessionData = { sessionId: "24", coachFuzzyId: "1-1", memberFuzzyId: "9-9" };
    }

    buildTransceivers = (peerId) => {
        this.transceivers[CONNECTION_KEY_VIDEO_STREAM] = this.buildVideoTransceiver(peerId);
        this.transceivers[CONNECTION_KEY_SCREEN_STREAM] = this.buildScreenTransceiver(peerId);
    }

    buildVideoTransceiver = (peerId) => {
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

    buildScreenTransceiver = (peerId) => {
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

    handleCallAdvice = (advice) => {
        const role = this.props.appStore.credentials.role;
        if (role === "guide" && advice.status === "ok") {
            this.callPeer(advice.memberSocketId);
        }
        if (role !== "guide" && advice.status === "ok") {
            this.callPeer(advice.guideSocketId);
        }
    }

    getSessionData = () => {
        const sessionId = this.props.appStore.sessionId;
        const role = this.props.appStore.credentials.role;
        const fuzzyId = this.props.appStore.credentials.userFuzzyId;

        return { sessionId: sessionId, fuzzyId: fuzzyId, role: role };
    }

    handleInvitation = ({ from: invitationFrom }) => {
        const callerName = invitationFrom.split('~')[1];
        message.info(`Call from ${callerName}`, 5)

        this.setState({ peerRequestStatus: 'active', invitationFrom });
    }

    registerSocketHooks = () => {
    
        socket
            .on('request', (data) => this.handleInvitation(data))
            .on('call', (data) => this.handleNegotiation(data))
            .on('end', this.endCall.bind(this, false))
            .on('callAdvice', (data) => this.handleCallAdvice(data))
            .emit('joinSession', this.getSessionData());
    }


    /**
     * The PeerId is the socket id of either the coach or the member
     */
    callPeer = (peerId) => {

        this.isCaller = true;
        this.buildTransceivers(peerId);

        if (peerId) {
            this.transceivers[CONNECTION_KEY_VIDEO_STREAM].start(true);
        }
    }

    joinCall = (peerId, preference) => {
        this.isCaller = false;
        this.buildTransceivers(peerId);
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

    componentDidMount() {

        window.addEventListener("resize", () => {
            const portalSize = { height: window.innerHeight, width: window.innerWidth };
            this.setState({ portalSize: portalSize });
        });

        this.registerSocketHooks();
    }

    render() {
        const { invitationFrom, screenStatus, peerRequestStatus, localSrc, peerSrc, screenSrc, portalSize } = this.state;
        const viewHeight = portalSize.height * 0.80;
        const canShare = this.peerStreamStatus === "active";

        return (
            <div style={{ padding: 10 }}>
                <Tabs defaultActiveKey="1" tabPosition="top">
                    <TabPane key="1" tab={<span><CameraOutlined />Video</span>}>
                        <div style={{ height: viewHeight }}>
                            <VideoBoard screenStatus={screenStatus} localSrc={localSrc} peerSrc={peerSrc} />
                        </div>
                    </TabPane>
                    <TabPane key="2" tab={<span><DesktopOutlined />Screen Sharing</span>}>
                        <div style={{ height: viewHeight }}>
                            <ScreenBoard screenStatus={screenStatus} screenSrc={screenSrc} />
                        </div>
                        <div style={{ paddingTop: 5 }}>
                            <Button onClick={this.shareScreen} disabled={!canShare} id="screenShare" type="primary" icon={<ShareAltOutlined />} shape="circle" />
                        </div>
                    </TabPane>
                    <TabPane key="3" tab={<span><EditOutlined />White Board</span>}>
                        Writtable Canvas Here
                        </TabPane>
                    <TabPane key="4" tab={<span><BookOutlined />References</span>}>
                        <BookPage />
                    </TabPane>
                    <TabPane key="5" tab={<span><AimOutlined />Session Plan</span>} >
                        <CurrentSessionPlan />
                    </TabPane>
                </Tabs>
                <Invitation status={peerRequestStatus} joinCall={this.joinCall} rejectCall={this.rejectCallHandler} invitationFrom={invitationFrom} />
            </div>
        )
    }
}
export default Broadcast