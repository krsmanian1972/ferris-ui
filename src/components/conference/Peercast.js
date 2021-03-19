import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Row, Col, Tooltip, Space, message } from 'antd';
import { CameraOutlined, AudioOutlined, BookOutlined, AudioMutedOutlined, EyeInvisibleOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';

import socket from '../stores/socket';
import VideoStreamTransceiver from '../webrtc/VideoStreamTransceiver';
import ScreenStreamTransceiver from '../webrtc/ScreenStreamTransceiver';

import NoteListStore from '../stores/NoteListStore';
import NotesStore from '../stores/NotesStore';
import NotesDrawer from '../commons/NotesDrawer';

import PeerVideoBoard from './PeerVideoBoard';

import Board from '../commons/Board';

import SharedCoachingPlan from '../plan/SharedCoachingPlan';
import SharedActionList from '../plan/SharedActionList';

const CONNECTION_KEY_VIDEO_STREAM = "peerVideoStream";
const CONNECTION_KEY_SCREEN_STREAM = "peerScreenStream";

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

            videoDevice: 'On',
            audioDevice: 'On',

            isScreenSharing: false,
            isMinimized: false,

            sessionStatus: '',

            portalSize: { height: window.innerHeight, width: window.innerWidth },

            // When the coach dictates a particular artifact for the member to view
            controlledArtifactId: "none",

            // When the member selects an artifact in the absence of controlled artifact
            memberArtifactId: "none",
        };

        // For Coach (Not for member)
        this.coachArtifactId = "none";

        this.canvasStream = null;
        this.transceivers = {};

        this.isCaller = false;
        this.peerStreamStatus = '';

        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

        const sessionUserId = this.props.params.sessionUserId;
        const enrollmentId = this.props.params.enrollmentId;
        const memberId = this.props.params.memberId;
        const sessionId = this.props.params.sessionId;
        const userId = this.props.appStore.credentials.id;

        this.isCoach = this.props.params.sessionUserType === 'coach';

        this.initializeNotesStore(sessionUserId);

        this.myBoard = <Board key={MY_BOARD_KEY} isCoach={this.isCoach} userId={userId} boardId={MY_BOARD_KEY} sessionUserId={sessionUserId} sessionId={sessionId} />
        this.coachingPlan = <SharedCoachingPlan key="gt" isCoach={this.isCoach} enrollmentId={enrollmentId} memberId={memberId} apiProxy={props.appStore.apiProxy} />
        this.actionList = <SharedActionList key="tt" isCoach={this.isCoach} enrollmentId={enrollmentId} memberId={memberId} apiProxy={props.appStore.apiProxy} />
    }

    initializeNotesStore = (sessionUserId) => {

        const noteListStore = new NoteListStore({
            apiProxy: this.props.appStore.apiProxy,
        });

        this.notesStore = new NotesStore({
            apiProxy: this.props.appStore.apiProxy,
            noteListStore: noteListStore,
            sessionUserId: sessionUserId,
        });

        noteListStore.load(sessionUserId, null);
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

    /**
     * If we are a coach we obtain an array of membersocketIds. Let us
     * call one of them in a Peer to Peer scenario.
     *   
     * @param {*} advice 
     */
    handleCallAdvice = (advice) => {

        const role = this.props.params.sessionUserType;

        this.setState({ sessionStatus: advice.reason });

        if (role === "coach" && advice.status === "ok") {
            this.callMember(advice);
        }
        if (role !== "coach" && advice.status === "ok") {
            this.callPeer(advice.guideSocketId);
        }
    }

    /**
     * The member is a serialized version of a ES6 Map. Hence needs to be
     * deserialized back to Map to obtain the member's socket id.
     * @param {*} advice 
     */
    callMember = (advice) => {
        const memberId = this.props.params.memberId;

        if (advice.members) {
            let memberSocketMap = new Map(JSON.parse(advice.members));
            const memberSocketId = memberSocketMap.get(memberId);
            this.callPeer(memberSocketId);
        }
    }

    getSessionData = () => {

        const sessionId = this.props.params.sessionId;
        const role = this.props.params.sessionUserType;
        const userId = this.props.appStore.credentials.id;

        this.setState({ sessionStatus: `Joining as ${role}` });

        return { sessionId: sessionId, userId: userId, role: role };
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
            .on('showArtifact', (preference) => this.handleArtifactEvent(preference))
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
        }
    }

    joinCall = (peerId) => {
        const preference = { audio: true, video: true };
        this.isCaller = false;
        this.buildTransceivers(peerId);
        this.transceivers[CONNECTION_KEY_VIDEO_STREAM].join(preference);
        this.setState({ sessionStatus: "Joining Call" });
        this.onArtifactChange(this.coachArtifactId);
    }

    onScreenSharing = (artifactId) => {

        const sessionId = this.props.params.sessionId;
        const userId = this.props.appStore.credentials.id;

        const data = { sessionId: sessionId, userId: userId, artifactId: artifactId };

        socket.emit('artifactChanged', data);
    }

    toggleScreenSharing = () => {
        const canShare = this.peerStreamStatus === "active";

        if (!canShare) {
            return;
        }

        if (!this.transceivers[CONNECTION_KEY_SCREEN_STREAM]) {
            return;
        }

        if (!this.state.isScreenSharing) {
            this.transceivers[CONNECTION_KEY_SCREEN_STREAM].start();
            this.setState({ isScreenSharing: true });
            this.onScreenSharing("peerScreen");
            return;
        }

        this.transceivers[CONNECTION_KEY_SCREEN_STREAM].mediaDevice.stop();
        this.setState({ isScreenSharing: false });
        this.onScreenSharing("none");
    }

    getScreenButton = (canShare, isScreenSharing) => {
        if (!canShare) {
            return <Button key="screen_bt" disabled={true} id="screen_bt" shape="round" >Screen</Button>
        }

        if (isScreenSharing) {
            return <Button key="screen_bt" id="screen_bt" style={{ background: "green", color: "white" }} shape="round" onClick={this.toggleScreenSharing} >Hide Screen</Button>
        }

        return <Button key="screen_bt" id="screen_bt" style={{ background: "black", color: "rgb(44, 147, 209)" }} shape="round" onClick={this.toggleScreenSharing} >Show Screen</Button>
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

    getMiniBoardIcon = () => {
        if (!this.state.isMinimized) {
            return <VerticalAlignBottomOutlined />;
        }
        return <VerticalAlignTopOutlined />;
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

    /**
     * Event Received from the Upstream
     * to synchronize the other Peer's View
     * @param {*} preference 
     */
    handleArtifactEvent = (preference) => {
        this.setState({ controlledArtifactId: preference.artifactId });
    }

    /**
     * When the coach changes the artifact view the member screen should
     * reflect the change.
     * 
     * When the member joins the meeting after the coach, the member screen
     * should be synchronized. So we send the onArtifactChange Message.
     * 
     * @param {*} artifactId 
     * @returns 
     */
    onArtifactChange = (artifactId) => {
        if (!this.isCoach) {
            return;
        }

        this.coachArtifactId = artifactId;

        const sessionId = this.props.params.sessionId;
        const userId = this.props.appStore.credentials.id;

        const data = { sessionId: sessionId, userId: userId, artifactId: artifactId };

        socket.emit('artifactChanged', data);
    }

    canAllowArtifactSelection = () => {
        if (this.isCoach) {
            return true;
        }

        return this.state.controlledArtifactId === "none";
    }

    toggleArtifact = (artifactId) => {

        if (!this.canAllowArtifactSelection()) {
            return;
        }

        if (this.isCoach) {
            this.setState({ controlledArtifactId: artifactId });
            this.onArtifactChange(artifactId);
        }
        else {
            this.setState({ memberArtifactId: artifactId });
        }
    }

    getMagicButton = () => {
        if (this.state.isScreenSharing) {
            return <></>
        }

        const currentArtifactId = this.getCurrentArtifactId();
        const shouldDisable = currentArtifactId === "none";

        if (shouldDisable) {
            return <></>
        }

        return (
            <Tooltip title="Hide Artifacts">
                <Button style={{ background: "black", color: "rgb(44, 147, 209)" }} icon={<EyeInvisibleOutlined />} shape="circle" onClick={() => this.toggleArtifact("none")} />
            </Tooltip>
        )
    }

    getButton = (label, artifactId) => {

        if (this.state.isScreenSharing) {
            return <></>
        }

        const currentArtifactId = this.getCurrentArtifactId();
        var shouldDisable = currentArtifactId === artifactId;
        if (!this.isCoach && this.state.controlledArtifactId !== "none") {
            shouldDisable = true;
        }

        if (shouldDisable) {
            return <Button key={artifactId} id={artifactId} disabled={true} shape="round">{label}</Button>
        }

        return <Button key={artifactId} id={artifactId} style={{ background: "black", color: "rgb(44, 147, 209)" }} shape="round" onClick={() => this.toggleArtifact(artifactId)}>{label}</Button>
    }

    /**
    * We have three contexual artifacts. 
    */
    getCurrentArtifactId = () => {
        if (this.isCoach) {
            return this.state.controlledArtifactId;
        }

        if (this.state.controlledArtifactId === "none") {
            return this.state.memberArtifactId;
        }

        return this.state.controlledArtifactId;
    }


    getArtifact = (artifactId) => {
        if (artifactId === "myBoard") {
            return this.myBoard;
        }
        else if (artifactId === "coachingPlan") {
            return this.coachingPlan;
        }
        else if (artifactId === "actionList") {
            return this.actionList;
        }
        return undefined;
    }

    render() {

        const { localSrc, peerSrc, screenSrc, portalSize, isMinimized, isScreenSharing } = this.state;
        const viewHeight = portalSize.height * 0.94;
        const canShare = this.peerStreamStatus === "active";
        const artifactId = this.getCurrentArtifactId();
        const artifact = this.getArtifact(artifactId);

        return (
            <div style={{ padding: 2, height: viewHeight }}>

                <PeerVideoBoard artifactId={artifactId} localSrc={localSrc} peerSrc={peerSrc} screenSrc={screenSrc} artifact={artifact} isMinimized={isMinimized} />

                <Row style={{ marginTop: 8 }}>
                    <Col span={4}>
                        {this.showSessionStatus()}
                    </Col>
                    <Col span={14} style={{ textAlign: "center" }}>
                        <Space>
                            {this.getScreenButton(canShare, isScreenSharing)}
                            {this.getButton("Board", "myBoard")}
                            {this.getButton("Plan", "coachingPlan")}
                            {this.getButton("Actions", "actionList")}
                            {this.getMagicButton()}
                        </Space>
                    </Col>
                    <Col span={6} style={{ textAlign: "right" }}>
                        <Space>
                            <Tooltip title="Notes">
                                <Button onClick={this.showNotes} disabled={false} id="notes" type="primary" icon={<BookOutlined />} shape="circle" />
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

                <NotesDrawer notesStore={this.notesStore} />
            </div>
        )
    }
}
export default Peercast
