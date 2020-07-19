import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import socket from '../stores/socket';
import VideoStreamTransceiver from '../webrtc/VideoStreamTransceiver';
import ScreenStreamTransceiver from '../webrtc/ScreenStreamTransceiver';
import NotesListStore from '../stores/NotesListStore';
import NotesStore from '../stores/NotesStore';

import NotesDrawer from './NotesDrawer';
import VideoBoard from './VideoBoard';
import Board from './Board';

import { Button, Row, Col, Tooltip, Space } from 'antd';
import { message } from 'antd';
import { ShareAltOutlined, CameraOutlined, AudioOutlined, StopOutlined, BookOutlined } from '@ant-design/icons';

const CONNECTION_KEY_VIDEO_STREAM = "peerVideoStream";
const CONNECTION_KEY_SCREEN_STREAM = "peerScreenStream";

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
            localBG:null,
            minimizeMiniBoard:false,
            portalSize: { height: window.innerHeight, width: window.innerWidth }
        };

        this.transceivers = {};

        this.isCaller = false;
        this.peerStreamStatus = '';

        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

        this.notesListStore = new NotesListStore({ 
            apiProxy: props.appStore.apiProxy,
            sessionUserFuzzyId: '71303b58-7af7-4c32-a441-308f73c9711d', 
        });
        
        this.notesStore = new NotesStore({ 
            apiProxy: props.appStore.apiProxy,
            notesListStore: this.notesListStore,
            sessionUserFuzzyId: '71303b58-7af7-4c32-a441-308f73c9711d',
        });

        this.initializeBoards();
    }

    initializeBoards = () => {
        this.myBoards = new Map();
        this.boardData = new Map();

        for (var i = 1; i < 3; i++) {
            const boardKey = `Board - ${i}`;
            const fileName = `${this.props.appStore.sessionId}_${this.props.appStore.credentials.userFuzzyId}_${i}`;
            const el = <Board key={boardKey} boardId={boardKey} saveBoardData={this.saveBoardData} getBoardData={this.getBoardData} fileName={fileName} />
            this.myBoards.set(boardKey, el);
            this.boardData.set(boardKey, null);
        }
    }

    saveBoardData = (boardKey, data) => {
        this.boardData.set(boardKey, data);
    }

    getBoardData = (boardKey) => {
        return this.boardData.get(boardKey);
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

    showNotes = () => {
        this.notesStore.showDrawer = true;
    }
    minimizeMiniBoard = () => {
	console.log("Called in Broadcast.js");
        if(this.state.minimizeMiniBoard === true)
        {
		this.setState({ minimizeMiniBoard: false });
        }
        else 
        {
		this.setState({ minimizeMiniBoard: true });
        }
        
        
    }

    render() {
        const { localSrc, peerSrc, screenSrc, portalSize, localBG } = this.state;
        const viewHeight = portalSize.height * 0.94;
        const canShare = this.peerStreamStatus === "active";

        return (
            <div style={{ padding: 8, height: viewHeight }}>
                <VideoBoard localSrc={localSrc} peerSrc={peerSrc} screenSrc={screenSrc} myBoards={this.myBoards} getBoardData={this.getBoardData} backGround={localBG} minmizeMiniBoard={this.state.minimizeMiniBoard}/>
                <Row style={{marginTop:2}}>
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
                            <Tooltip title="Mute Camera">
                                <Button disabled={true} type="primary" icon={<CameraOutlined />} shape="circle" />
                            </Tooltip>
                            <Tooltip title="Mute Audio">
                                <Button disabled={true} type="primary" icon={<AudioOutlined />} shape="circle" />
                            </Tooltip>
                            <Tooltip title="Close Activity">
                                <Button disabled={true} type="primary" icon={<StopOutlined />} shape="circle" />
                            </Tooltip>
                            <Tooltip title="Minimize Mini Board">
                                <Button onClick={this.minimizeMiniBoard} type="primary" icon={<StopOutlined />} shape="circle" />
                            </Tooltip>

                        </Space>
                    </Col>
                </Row>
                <NotesDrawer notesStore = {this.notesStore} />
            </div>
        )
    }
}
export default Broadcast
