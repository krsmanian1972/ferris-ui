import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import { Button, Row, Col, Tooltip, Space,message } from 'antd';
import { ShareAltOutlined, CameraOutlined, AudioOutlined, StopOutlined, BookOutlined, AudioMutedOutlined, EyeInvisibleOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';

import socket from '../stores/socket';
import VideoStreamTransceiver from '../webrtc/VideoStreamTransceiver';
import ScreenStreamTransceiver from '../webrtc/ScreenStreamTransceiver';
import BoardStreamTransceiver from '../webrtc/BoardStreamTransceiver';

import NoteListStore from '../stores/NoteListStore';
import NotesStore from '../stores/NotesStore';

import VideoBoard from './PeerVideoBoard';

import NotesDrawer from '../commons/NotesDrawer';
import Board from '../commons/Board';

import SharedCoachingPlan from '../plan/SharedCoachingPlan';
import SharedActionList from '../plan/SharedActionList';

const CONNECTION_KEY_VIDEO_STREAM = "peerVideoStream";
const CONNECTION_KEY_SCREEN_STREAM = "peerScreenStream";
const CONNECTION_KEY_BOARD_STREAM = "peerBoardStream";

const MY_BOARD_KEY = 'myBoard';


@inject("appStore")
@observer
class Peercast extends Component {
    constructor(props) {
        super(props);

        this.state = {

            screenStatus: '',
            boardStatus: '',

            peerRequestStatus: '',
            invitationFrom: '',
            peerId: '',

            localSrc: null,
            peerSrc: null,
            screenSrc: null,
            boardSrc: null,

            videoDevice: 'On',
            audioDevice: 'On',

            isScreenSharing: false,
            isMinimized: false,

            sessionStatus: '',

            portalSize: { height: window.innerHeight, width: window.innerWidth }
        };

        this.canvasStream = null;
        this.transceivers = {};

        this.isCaller = false;
        this.peerStreamStatus = '';

        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

        const sessionUserId = this.props.params.sessionUserId;
        const enrollmentId = this.props.params.enrollmentId;
        const memberId = this.props.params.memberId;
        const isCoach = this.props.params.sessionUserType === 'coach';

        this.initializeNotesStore(sessionUserId);
        
        this.myBoard = <Board key={MY_BOARD_KEY} boardId={MY_BOARD_KEY} sessionUserId={sessionUserId} onCanvasStream={this.onCanvasStream} />
        this.coachingPlan = <SharedCoachingPlan key="gt" isCoach = {isCoach} enrollmentId={enrollmentId} memberId={memberId} apiProxy={props.appStore.apiProxy} />
        this.actionList = <SharedActionList key="tt" isCoach = {isCoach} enrollmentId={enrollmentId} memberId={memberId} apiProxy={props.appStore.apiProxy} />
    }

    initializeNotesStore = (sessionUserId) => {

        this.noteListStore = new NoteListStore({
            apiProxy: this.props.appStore.apiProxy,
        });

        this.notesStore = new NotesStore({
            apiProxy: this.props.appStore.apiProxy,
            noteListStore: this.noteListStore,
            sessionUserId: sessionUserId,
        });
    }

    onCanvasStream = (stream) => {
        this.canvasStream = stream;

        const boardTransceiver = this.transceivers[CONNECTION_KEY_BOARD_STREAM]

        if (boardTransceiver) {
            boardTransceiver.start(this.canvasStream);
        }
    }

    buildTransceivers = (peerId) => {
        this.transceivers[CONNECTION_KEY_VIDEO_STREAM] = this.buildVideoTransceiver(peerId);
        this.transceivers[CONNECTION_KEY_SCREEN_STREAM] = this.buildScreenTransceiver(peerId);
        this.transceivers[CONNECTION_KEY_BOARD_STREAM] = this.buildBoardTransceiver(peerId);
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
                const newState = { peerSrc: src, sessionStatus: 'Active' };
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

    buildBoardTransceiver = (peerId) => {
        return new BoardStreamTransceiver(peerId, CONNECTION_KEY_BOARD_STREAM)
            .on(CONNECTION_KEY_BOARD_STREAM, (src) => {
                const newState = { boardStatus: 'active', boardSrc: src };
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

        const role = this.props.params.sessionUserType;

        this.setState({ sessionStatus: advice.reason });

        if (role === "coach" && advice.status === "ok") {
            this.callPeer(advice.memberSocketId);
        }
        if (role !== "coach" && advice.status === "ok") {
            this.callPeer(advice.guideSocketId);
        }
    }

    getSessionData = () => {

        const sessionId = this.props.params.sessionId;
        const role = this.props.params.sessionUserType;
        const fuzzyId = this.props.appStore.credentials.id;

        this.setState({ sessionStatus: `Joining as ${role}` });

        return { sessionId: sessionId, fuzzyId: fuzzyId, role: role };
    }

    handleInvitation = ({ from: invitationFrom }) => {
        const callerName = invitationFrom.split('~')[1];

        const info = `${callerName} is joining`

        message.info(info, 5)

        this.setState({ peerRequestStatus: 'active', invitationFrom, sessionStatus: info });

        this.joinCall(invitationFrom);
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
        this.setState({ sessionStatus: "Streaming" })

        if (peerId) {
            this.transceivers[CONNECTION_KEY_VIDEO_STREAM].start(true);
            this.transceivers[CONNECTION_KEY_BOARD_STREAM].start(this.canvasStream);
        }
    }

    joinCall = (peerId) => {
        const preference = { audio: true, video: true };
        this.isCaller = false;
        this.buildTransceivers(peerId);
        this.transceivers[CONNECTION_KEY_VIDEO_STREAM].join(preference);
        this.transceivers[CONNECTION_KEY_BOARD_STREAM].start(this.canvasStream);
        this.setState({ sessionStatus: "Joining Call" })
    }

    toggleScreenSharing = () => {
        const canShare = this.peerStreamStatus === "active";
        
        if(!canShare) {
            return;
        }

        if (!this.transceivers[CONNECTION_KEY_SCREEN_STREAM]) {
            return;
        }

        if (!this.state.isScreenSharing) {
            this.transceivers[CONNECTION_KEY_SCREEN_STREAM].start();
            this.setState({ isScreenSharing: true });
            return;
        }

        this.transceivers[CONNECTION_KEY_SCREEN_STREAM].mediaDevice.stop();
        this.setState({ isScreenSharing: false });
    }

    rejectCall() {
        const { invitationFrom } = this.state;
        socket.emit('end', { to: invitationFrom });
        this.setState({ peerRequestStatus: '' });
    }

    endCall(isStarter) {
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

    showNotes = () => {
        this.notesStore.showDrawer = true;
    }

    minimizeMiniBoard = () => {
        if (this.state.isMinimized === true) {
            this.setState({ isMinimized: false });
        }
        else {
            this.setState({ isMinimized: true });
        }
    }

    getAudioIcon = () => {
        if (this.state.audioDevice === 'On') {
            return <AudioOutlined />;
        }
        return <AudioMutedOutlined />
    }

    getVideoIcon = () => {
        if (this.state.videoDevice === 'On') {
            return <CameraOutlined />
        }
        return <EyeInvisibleOutlined />;
    }

    getVideoTooltip = () => {
        if (this.state.videoDevice === 'On') {
            return "Turn-off the Camera";
        }
        return "Turn-on the Camera";
    }

    getAudioTooltip = () => {
        if (this.state.audioDevice === 'On') {
            return "Mute the Microphone";
        }
        return "Unmute the Microphone";
    }

    getMiniBoardTooltip = () => {
        if (!this.state.isMinimized) {
            return "Hide Panels";
        }
        return "Show Panels";
    }

    getShareScreenTooltip = () => {
        if (!this.state.isScreenSharing) {
            return "Start Screen Sharing";
        }
        return "Stop Screen Sharing";
    }

    getMiniBoardIcon = () => {
        if (!this.state.isMinimized) {
            return <VerticalAlignBottomOutlined />;
        }
        return <VerticalAlignTopOutlined />;
    }

    getShareScreenIcon = () => {
        if(!this.state.isScreenSharing) {
            return <ShareAltOutlined/>;
        }
        return <StopOutlined/>;
    }

    toggleVideoDevice = () => {
        if (!this.transceivers[CONNECTION_KEY_VIDEO_STREAM]) {
            return;
        }

        this.transceivers[CONNECTION_KEY_VIDEO_STREAM].mediaDevice.toggle('Video');
        if (this.state.videoDevice === 'On') {
            this.setState({ videoDevice: 'Off' })
        }
        else {
            this.setState({ videoDevice: 'On' })
        }
    }

    toggleAudioDevice = () => {
        if (!this.transceivers[CONNECTION_KEY_VIDEO_STREAM]) {
            return;
        }
        this.transceivers[CONNECTION_KEY_VIDEO_STREAM].mediaDevice.toggle('Audio');
        if (this.state.audioDevice === 'On') {
            this.setState({ audioDevice: 'Off' })
        }
        else {
            this.setState({ audioDevice: 'On' })
        }
    }

    showSessionStatus = () => {
        return <p>{this.state.sessionStatus}</p>
    }

    render() {
        const { localSrc, peerSrc, screenSrc, boardSrc, portalSize, isMinimized } = this.state;
        const viewHeight = portalSize.height * 0.94;
        const canShare = this.peerStreamStatus === "active";
        const sessionUserId = this.props.params.sessionUserId;

        return (
            <div style={{ padding: 2, height: viewHeight }}>

                <VideoBoard localSrc={localSrc} peerSrc={peerSrc} screenSrc={screenSrc} boardSrc={boardSrc} myBoard={this.myBoard} coachingPlan={this.coachingPlan} actionList = {this.actionList} isMinimized={isMinimized} />

                <Row style={{ marginTop: 8 }}>
                    <Col span={12}>
                        {this.showSessionStatus()}
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                        <Space>
                            <Tooltip title="Notes">
                                <Button onClick={this.showNotes} disabled={false} id="notes" type="primary" icon={<BookOutlined />} shape="circle" />
                            </Tooltip>

                            <Tooltip title={this.getShareScreenTooltip()}>
                                <Button disabled={!canShare} id="screenShare" type="primary" icon={this.getShareScreenIcon()} shape="circle" onClick={this.toggleScreenSharing}/>
                            </Tooltip>

                            <Tooltip title={this.getVideoTooltip()}>
                                <Button disabled={!canShare} type="primary" icon={this.getVideoIcon()} shape="circle" onClick={this.toggleVideoDevice} />
                            </Tooltip>
                            <Tooltip title={this.getAudioTooltip()}>
                                <Button disabled={!canShare} type="primary" icon={this.getAudioIcon()} shape="circle" onClick={this.toggleAudioDevice} />
                            </Tooltip>
                            <Tooltip title={this.getMiniBoardTooltip()}>
                                <Button onClick={this.minimizeMiniBoard} type="primary" icon={this.getMiniBoardIcon()} shape="circle" />
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>

                <NotesDrawer notesStore={this.notesStore} sessionUserId={sessionUserId} apiProxy={this.props.appStore.apiProxy} />
            </div>
        )
    }
}
export default Peercast
