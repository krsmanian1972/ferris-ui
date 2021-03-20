import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Row, Col, Space, Button, Tooltip, Tag } from 'antd';
import { CameraOutlined, AudioOutlined, BookOutlined, AudioMutedOutlined, EyeInvisibleOutlined, CompressOutlined, ExpandOutlined } from '@ant-design/icons';

import socket from '../stores/socket';

import NoteListStore from '../stores/NoteListStore';
import NotesStore from '../stores/NotesStore';
import NotesDrawer from '../commons/NotesDrawer';

import VideoRoom from './VideoRoom';
import Screencast from './Screencast';
import VideoPanel from './VideoPanel';
import ArtifactPanel from './ArtifactPanel';

import ModhakamLauncher from '../games/ModhakamLauncher';

import Board from '../commons/Board';

const MY_BOARD_KEY = 'myBoard';

@inject("appStore")
@observer
class Broadcast extends Component {

	constructor(props) {
		super(props);

		this.state = {
			myVideoStream: null,
			myScreenStream: null,

			isActive: false,
			isPrepared: false,

			status: '',
			screenStatus: '',

			message: '',

			videoDevice: 'On',
			audioDevice: 'On',
			isMinimized: false,

			isScreenSharing: false,
			isGameMode: false,
			isBoardMode: false,

			portalSize: { height: window.innerHeight, width: window.innerWidth },

			// When the coach dictates a particular artifact for the member to view
			controlledArtifactId: "none",

			// When the member selects an artifact in the absence of controlled artifact
			memberArtifactId: "none",
		}

		this.isCoach = this.props.params.sessionUserType === 'coach';

		// For Coach (Not for member)
		this.coachArtifactId = "none"
	}

	/**
	 * A callback to allow the VideoRoom and Screencast to update 
	 * the events so that we adjust the react state
	 * @param {*} event 
	 */
	roomListener = (event) => {
		this.setState(event);
	}

	componentDidMount() {

		window.addEventListener("resize", () => {
			const portalSize = { height: window.innerHeight, width: window.innerWidth };
			this.setState({ portalSize: portalSize });
		});

		this.auditUser();

		this.registerSocketHooks();
	}

	auditUser = () => {

		this.opaqueId = this.props.params.sessionUserId;
		this.myusername = `${this.props.appStore.credentials.username}-${this.props.params.sessionUserType}`;

		this.videoRoom = new VideoRoom(this.props, this.roomListener);
		this.screencast = new Screencast(this.props, this.roomListener);

		this.initializeNotesStore();

		this.videoRoom.startRoom();
		this.screencast.prepare();
	}

	registerSocketHooks = () => {
		socket
			.on('callAdvice', (advice) => this.handleCallAdvice(advice))
			.on('call', (data) => this.handleNegotiation(data))
			.on('showArtifact', (preference) => this.handleArtifactEvent(preference))
			.emit('joinSession', this.getConferenceData());
	}

	/**
	 * When the member joins the call in an on going conference 
	 * the member shall ask the coach to publish its current artifact id. 
	 * 
	 * Current artifactId is the artifact the coach is showing to others.
	 * 
	 * @returns 
	 */
	handleCallAdvice = (advice) => {

		if (this.isCoach) {
			return;
		}

		if (advice.status !== "ok") {
			return;
		}

		const conferenceId = this.props.params.conferenceId;
		const userId = this.props.appStore.credentials.id;

		socket.emit('call', {
			type: "whichArtifact",
			userId: userId,
			to: advice.guideSocketId,
			sessionId: conferenceId,
		});
	}

	/**
	 * When two peers needs to align on certain items.
	 * Eg. A member asked the coach whichArtifact I should prefer
	 * 
	 * @param {*} data 
	 */
	handleNegotiation = (data) => {
		if (data.type && data.type === "whichArtifact") {
			this.onArtifactChange(this.coachArtifactId);
		}
	}

	/**
	 * Let us use the conference Id instead of sessionId.
	 * All the different sessions have one common conferenceId
	 * @returns 
	 */
	getConferenceData = () => {
		const conferenceId = this.props.params.conferenceId;
		const role = this.props.params.sessionUserType;
		const userId = this.props.appStore.credentials.id;

		return { sessionId: conferenceId, userId: userId, role: role };
	}

	initializeNotesStore = () => {

		const noteListStore = new NoteListStore({
			apiProxy: this.props.appStore.apiProxy,
		});

		this.notesStore = new NotesStore({
			apiProxy: this.props.appStore.apiProxy,
			noteListStore: noteListStore,
			sessionUserId: this.opaqueId,
		});

		noteListStore.load(this.opaqueId, null);
	}

	getVideoIcon = () => {
		if (this.state.videoDevice === 'On') {
			return <CameraOutlined />
		}
		return <EyeInvisibleOutlined />;
	}

	getVideoTooltip = () => {
		if (this.state.videoDevice === 'On') {
			return "Pause Video transmission";
		}
		return "Allow Video transmission";
	}

	toggleVideoDevice = () => {
		if (this.state.videoDevice === 'On') {
			this.videoRoom.muteVideo();
			this.setState({ videoDevice: 'Off' })
		}
		else {
			this.videoRoom.unmuteVideo();
			this.setState({ videoDevice: 'On' })
		}
	}

	getAudioIcon = () => {
		if (this.state.audioDevice === 'On') {
			return <AudioOutlined />;
		}
		return <AudioMutedOutlined />
	}

	getAudioTooltip = () => {
		if (this.state.audioDevice === 'On') {
			return "Mute the Microphone";
		}
		return "Unmute the Microphone";
	}

	toggleAudioDevice = () => {
		if (this.state.audioDevice === 'On') {
			this.videoRoom.muteAudio();
			this.setState({ audioDevice: 'Off' })
		}
		else {
			this.videoRoom.unmuteAudio();
			this.setState({ audioDevice: 'On' })
		}
	}

	/**
	 * Make the Notes Drawer visible by changing the Observable
	 */
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

	getMiniBoardTooltip = () => {
		if (!this.state.isMinimized) {
			return "Hide Video Panels";
		}
		return "Show Video Panels";
	}

	getMiniBoardIcon = () => {
		if (!this.state.isMinimized) {
			return <CompressOutlined />;
		}
		return <ExpandOutlined />;
	}

	/**
	 * the remote feeds we accumulated in the video room feed map
	 */
	getPeerVideos = () => {
		const peerVideos = [];

		if (!this.videoRoom) {
			return peerVideos;
		}

		for (const [key, remoteFeed] of this.videoRoom.remoteFeedMap) {
			if (remoteFeed) {
				const el = <VideoPanel key={key} stream={remoteFeed.stream} isLocal={false} username={remoteFeed.rfdisplay} />
				peerVideos.push(el);
			}
		}

		return peerVideos;
	}


	render() {

		const { myVideoStream, portalSize, isMinimized, isActive, isPrepared } = this.state;

		const viewHeight = portalSize.height * 0.94;
		const viewPanelHeight = viewHeight * 0.99;

		const videoPanelStyle = isMinimized ? { height: viewPanelHeight, width: 10 } : { height: viewPanelHeight };

		const artifactPanelStyle = isMinimized ? { height: viewPanelHeight, width: "100%" } : { height: viewPanelHeight };

		return (
			<div style={{ padding: 2, height: viewHeight }}>

				<div className="broadcast-workbench">
					<div className="broadcast-west" style={videoPanelStyle}>
						{this.getPeerVideos().map(value => value)}
						<VideoPanel key="local" stream={myVideoStream} isLocal={true} username={this.myusername} />
					</div>
					<div className="broadcast-center" style={artifactPanelStyle}>
						{this.renderArtifacts(artifactPanelStyle)}
					</div>
				</div>

				{this.renderControls(isActive, isPrepared)}

				{this.opaqueId && <NotesDrawer notesStore={this.notesStore} />}
			</div>
		)
	}

	/**
	 * A coach can lock a members accessible widgets.
	 * @returns 
	 */
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

	getPeerScreens = () => {
		const peerScreens = [];

		if (!this.screencast) {
			return peerScreens;
		}

		for (const [key, remoteFeed] of this.screencast.remoteFeedMap) {
			if (remoteFeed) {
				const el = <ArtifactPanel key={key} stream={remoteFeed.stream} username={remoteFeed.rfdisplay} />
				peerScreens.push(el);
			}
		}

		return peerScreens;
	}


	/**
	 * An event update function is expected to be return by the **Launcher
	 * @param {*} eventSink 
	 */
	gameCallback = (eventSink) => {
		this.gameEventSink = eventSink;
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

		const conferenceId = this.props.params.conferenceId;
		const userId = this.props.appStore.credentials.id;

		const data = {
			sessionId: conferenceId,
			userId: userId,
			artifactId: artifactId
		};

		socket.emit('artifactChanged', data);
	}

	/**
	 * Event Received from the Upstream Coach
	 * to synchronize the Member's artifact view.
	 * @param {*} preference 
	 */
	handleArtifactEvent = (preference) => {
		this.setState({ controlledArtifactId: preference.artifactId });
	}

	/**
	 * Blackboard will be given the highest priority, followed by
	 * Experiential Lab. 
	 * 
	 * ScreenSharing is the least priority artifact.
	 * 
	 */
	renderArtifacts = (artifactPanelStyle) => {

		const { controlledArtifactId, isPrepared } = this.state;

		if (controlledArtifactId === "myBoard") {
			const sessionUserId = this.props.params.sessionUserId;
			const conferenceId = this.props.params.conferenceId;
			const userId = this.props.appStore.credentials.id;
			return (
				<div className="activeItem" style={{ background: "#646464" }}>
					<Board key={MY_BOARD_KEY} isCoach={this.isCoach} userId={userId} boardId={MY_BOARD_KEY} sessionUserId={sessionUserId} sessionId={conferenceId} />
				</div>
			)
		}

		if (controlledArtifactId === "lab" && isPrepared) {
			return (
				<>
					<ModhakamLauncher height={artifactPanelStyle.height} screencast={this.screencast} username={this.myusername} callback={this.gameCallback} />
					{this.gameEventSink && this.gameEventSink()}
				</>
			)
		}

		if (controlledArtifactId === "screen" && isPrepared) {
			return (
				<>
					{this.getPeerScreens().map(value => value)}
				</>
			)
		}
	}

	onScreenSharing = (artifactId) => {

		const sessionId = this.props.params.conferenceId;
		const userId = this.props.appStore.credentials.id;

		const data = { sessionId: sessionId, userId: userId, artifactId: artifactId };

		socket.emit('artifactChanged', data);
	}

	toggleScreenSharing = () => {

		if (!this.state.isScreenSharing) {
			this.screencast.startScreenSharing();
			this.setState({ isScreenSharing: true });
			this.onScreenSharing("screen");
			return;
		}

		this.screencast.stopSharing();
		this.setState({ isScreenSharing: false });
		this.onScreenSharing("none");
	}

	getScreenButton = (canShare) => {

		if (!canShare) {
			return <Button key="screen_bt" disabled={true} id="screen_bt" shape="round" >Screen</Button>
		}

		if (this.state.isScreenSharing) {
			return <Button key="screen_bt" id="screen_bt" style={{ background: "green", color: "white" }} shape="round" onClick={this.toggleScreenSharing} >Hide Screen</Button>
		}

		return <Button key="screen_bt" id="screen_bt" style={{ background: "black", color: "rgb(44, 147, 209)" }} shape="round" onClick={this.toggleScreenSharing} >Show Screen</Button>
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


	renderControls = (isActive, isPrepared) => {

		return (
			<Row style={{ marginTop: 8 }}>
				<Col span={10} style={{ textAlign: "left" }}>
					<Space>
						<Tooltip key="video_tp" title={this.getVideoTooltip()}>
							<Button key="video_bt" disabled={!isActive} type="primary" icon={this.getVideoIcon()} shape="circle" onClick={this.toggleVideoDevice} />
						</Tooltip>
						<Tooltip key="audio_tp" title={this.getAudioTooltip()}>
							<Button key="audio_bt" disabled={!isActive} type="primary" icon={this.getAudioIcon()} shape="circle" onClick={this.toggleAudioDevice} />
						</Tooltip>
						<Tooltip key="min_tp" title={this.getMiniBoardTooltip()}>
							<Button key="min_bt" onClick={this.minimizeMiniBoard} type="primary" icon={this.getMiniBoardIcon()} shape="circle" />
						</Tooltip>
						<Tag key="stat_tg" color="#646464">{this.state.status}</Tag>
					</Space>
				</Col>
				<Col span={8} style={{ textAlign: "center" }}>
					<Space>
						{this.getScreenButton(isPrepared)}
						{this.getButton("Board", "myBoard")}
						{this.getButton("Lab", "lab")}
						{this.getMagicButton()}
					</Space>
				</Col>
				<Col span={6} style={{ textAlign: "right" }}>
					<Space>
						<Tooltip key="notes_tp" title="Notes">
							<Button key="notes_bt" onClick={this.showNotes} id="notes" type="primary" icon={<BookOutlined />} shape="circle" />
						</Tooltip>
					</Space>
				</Col>
			</Row>
		)
	}

}

export default Broadcast;


