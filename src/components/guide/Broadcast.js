import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import socket from '../stores/socket';
import VideoStreamTransceiver from '../webrtc/VideoStreamTransceiver';
import ScreenStreamTransceiver from '../webrtc/ScreenStreamTransceiver';
import NoteListStore from '../stores/NoteListStore';
import NotesStore from '../stores/NotesStore';

import NotesDrawer from './NotesDrawer';
import VideoBoard from './VideoBoard';
import Board from './Board';

import { Button, Row, Col, Tooltip, Space } from 'antd';
import { message } from 'antd';
import { ShareAltOutlined, CameraOutlined, AudioOutlined, StopOutlined, BookOutlined, AudioMutedOutlined, EyeInvisibleOutlined } from '@ant-design/icons';


const CONNECTION_KEY_VIDEO_STREAM = "peerVideoStream";
const CONNECTION_KEY_SCREEN_STREAM = "peerScreenStream";

const MY_BOARD_KEY = 'myBoard';

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

            videoDevice: 'On',
            audioDevice: 'On',

            minimizeMiniBoard: false,

            portalSize: { height: window.innerHeight, width: window.innerWidth }
        };

        this.transceivers = {};

        this.isCaller = false;
        this.peerStreamStatus = '';

        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

        const sessionUserId = this.props.params.sessionUserId;

        this.initializeNotesStore(sessionUserId);
        this.initializeBoards(sessionUserId);
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

    initializeBoards = (sessionUserId) => {
        this.myBoards = new Map();
        const el = <Board key={MY_BOARD_KEY} boardId={MY_BOARD_KEY} sessionUserId={sessionUserId} />
        this.myBoards.set(MY_BOARD_KEY, el);
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
        const sessionId = this.props.params.sessionId;
        const role = this.props.params.sessionUserType;
        const fuzzyId = this.props.appStore.credentials.id;

        return { sessionId: sessionId, fuzzyId: fuzzyId, role: role };
    }

    handleInvitation = ({ from: invitationFrom }) => {
        const callerName = invitationFrom.split('~')[1];

        message.info(`${callerName} is joining`, 5)

        this.setState({ peerRequestStatus: 'active', invitationFrom });

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

        if (peerId) {
            this.transceivers[CONNECTION_KEY_VIDEO_STREAM].start(true);
        }
    }

    joinCall = (peerId) => {
        const preference = { audio: true, video: true };
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
        if (this.state.minimizeMiniBoard === true) {
            this.setState({ minimizeMiniBoard: false });
        }
        else {
            this.setState({ minimizeMiniBoard: true });
        }
    }

    getAudioIcon = () => {
        if (this.state.audioDevice === 'On') {
            return <AudioOutlined/>;
        }
        return <AudioMutedOutlined/>
    }

    getVideoIcon = () => {
        if (this.state.videoDevice === 'On') {
            return <CameraOutlined/>
        }
        return <EyeInvisibleOutlined/>;
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
        if (!this.state.minimizeMiniBoard) {
            return "Hide the Mini-Boards";
        }
        return "Show the Mini-Boards";
    }
    
    toggleVideoDevice = () => {
        if(!this.transceivers[CONNECTION_KEY_VIDEO_STREAM]) {
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
        if(!this.transceivers[CONNECTION_KEY_VIDEO_STREAM]) {
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

    render() {
        const { localSrc, peerSrc, screenSrc, portalSize, minimizeMiniBoard } = this.state;
        const viewHeight = portalSize.height * 0.94;
        const canShare = this.peerStreamStatus === "active";
        const sessionUserId = this.props.params.sessionUserId;

        return (
            <div style={{ padding: 8, height: viewHeight }}>

                <VideoBoard localSrc={localSrc} peerSrc={peerSrc} screenSrc={screenSrc} myBoards={this.myBoards} minmizeMiniBoard={minimizeMiniBoard} />

                <Row style={{ marginTop: 2 }}>
                    <Col span={12}>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                        <Space>
                            <Tooltip title="Notes">
                                <Button onClick={this.showNotes} disabled={false} id="notes" type="primary" icon={<BookOutlined />} shape="circle" />
                            </Tooltip>
                            <Tooltip title="Share Screen">
                                <Button onClick={this.shareScreen} disabled={!canShare} id="screenShare" type="primary" icon={<ShareAltOutlined />} shape="circle" />
                            </Tooltip>
                            <Tooltip title={this.getVideoTooltip()}>
                                <Button disabled={!canShare} type="primary" icon={this.getVideoIcon()} shape="circle" onClick={this.toggleVideoDevice} />
                            </Tooltip>
                            <Tooltip title={this.getAudioTooltip()}>
                                <Button disabled={!canShare} type="primary" icon={this.getAudioIcon()} shape="circle" onClick={this.toggleAudioDevice} />
                            </Tooltip>
                            <Tooltip title={this.getMiniBoardTooltip()}>
                                <Button onClick={this.minimizeMiniBoard} type="primary" icon={<StopOutlined />} shape="circle" />
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>

                <NotesDrawer notesStore={this.notesStore} sessionUserId={sessionUserId} apiProxy={this.props.appStore.apiProxy} />
            </div>
        )
    }
}
export default Broadcast
