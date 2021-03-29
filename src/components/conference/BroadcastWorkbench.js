import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Row, Col, Space, Button, Tooltip } from 'antd';
import { BookOutlined, UnlockOutlined } from '@ant-design/icons';

import socket from '../stores/socket';

import NoteListStore from '../stores/NoteListStore';
import NotesStore from '../stores/NotesStore';
import NotesDrawer from '../commons/NotesDrawer';

import Screencast from './Screencast';
import ArtifactPanel from './ArtifactPanel';

import ModhakamLauncher from '../games/ModhakamLauncher';

import Board from '../commons/Board';

const MY_BOARD_KEY = 'myBoard';

@inject("appStore")
@observer
class BroadcastWorkbench extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isPrepared: false,

			status: '',
			screenStatus: '',

			message: '',

			isScreenSharing: false,
			isGameMode: false,
			isBoardMode: false,

			// When the coach dictates a particular artifact for the member to view
			controlledArtifactId: "none",
		}

		this.isCoach = this.props.params.sessionUserType === 'coach';

		// For Coach (Not for member). We will use this to 
		// temporarily hold the screen sharing id by a member.
		// Because we have to supply this value to the newly joining person.
		this.coachArtifactId = "none"
	}

	/**
	 * A callback to allow the Screencast to update 
	 * the events so that we adjust the react state
	 * @param {*} event 
	 */
	roomListener = (event) => {
		this.setState(event);
	}

	componentDidMount() {

		this.auditUser();

		this.registerSocketHooks();
	}

	auditUser = () => {

		this.myusername = `${this.props.appStore.credentials.username}-${this.props.params.sessionUserType}`;
		this.opaqueId = this.props.params.sessionUserId;

		this.initializeNotesStore();

		this.screencast = new Screencast(this.props, this.roomListener);
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

	/**
	 * Make the Notes Drawer visible by changing the Observable
	 */
	showNotes = () => {
		this.notesStore.showDrawer = true;
	}

	render() {
		const { isPrepared } = this.state;
		return (
			<div className="broadcast-workbench">
				<div className="broadcast-top">
					{this.renderArtifacts()}
				</div>
				<div className="broadcast-south">
					{this.renderControls(isPrepared)}
				</div>
				{this.opaqueId && <NotesDrawer notesStore={this.notesStore} />}
			</div>
		)
	}

	toggleArtifact = (artifactId) => {

		if (!this.isCoach) {
			return true;
		}

		this.setState({ controlledArtifactId: artifactId });
		this.onArtifactChange(artifactId);
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
				break;
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

		const data = { sessionId: conferenceId, userId: userId, artifactId: artifactId };

		socket.emit('artifactChanged', data);
	}

	handleArtifactEvent = (preference) => {

		// A member can't control the artifact of a coach except the screen sharing
		if (this.isCoach && preference.artifactId !== "screen") {
			return;
		}

		// To avoid re-rendering the screen of existing member due to any late joinees
		if (preference.artifactId === this.state.controlledArtifactId) {
			return;
		}

		// The user is non-coach and the artifact_id is anything except screen
		if (preference.artifactId !== "screen") {
			this.setState({ controlledArtifactId: preference.artifactId });
			return;
		}

		this.handleScreenEvent(preference);
	}

	handleScreenEvent = (preference) => {

		// We should ignore the off when the coach is showing a different artifact.
		if (preference.intent === "off") {
			if (!preference.senderIsCoach) {
				if (this.state.controlledArtifactId !== "none") {
					return;
				}
			}

			if (this.isCoach) {
				this.coachArtifactId = "none";
			}
			this.setState({ controlledArtifactId: "none" });
			return;
		}

		// Mark the coach artifactId as Screen To answer any whichArtifact by the late joinees;
		if (this.isCoach) {
			this.coachArtifactId = "screen";
		}

		this.setState({ controlledArtifactId: "screen" });
	}


	/**
	 * Blackboard will be given the highest priority, followed by
	 * Experiential Lab. 
	 * 
	 * ScreenSharing is the least priority artifact.
	 * 
	 */
	renderArtifacts = () => {

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
					<ModhakamLauncher height={this.props.height} screencast={this.screencast} username={this.myusername} callback={this.gameCallback} />
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

	/**
	 * When we are sharing our screen, we are not modifying the controlledArtifactId.
	 * 
	 * 
	 * @param {*} intent 
	 */
	onScreenSharing = (intent) => {

		this.coachArtifactId = intent === "on" ? "screen" : "none";

		const sessionId = this.props.params.conferenceId;
		const userId = this.props.appStore.credentials.id;

		const data = { sessionId: sessionId, userId: userId, artifactId: "screen", intent: intent, senderIsCoach: this.isCoach };

		socket.emit('artifactChanged', data);
	}

	toggleScreenSharing = () => {

		if (!this.state.isScreenSharing && this.state.controlledArtifactId === "none") {
			this.screencast.startScreenSharing();
			this.setState({ isScreenSharing: true });
			this.onScreenSharing("on");
			return;
		}

		this.screencast.stopSharing();
		this.setState({ isScreenSharing: false });
		this.onScreenSharing("off");
	}

	getScreenButton = (canShare) => {

		if (!canShare) {
			return <></>
		}

		if (this.state.isScreenSharing) {
			return <Button key="screen_bt" id="screen_bt" style={{ background: "green", color: "white" }} shape="round" onClick={this.toggleScreenSharing} >Hide Screen</Button>
		}

		if (this.state.controlledArtifactId !== "none") {
			return <Button key="screen_bt" disabled={true} id="screen_bt" shape="round" >Screen</Button>
		}

		return <Button key="screen_bt" id="screen_bt" style={{ background: "black", color: "rgb(44, 147, 209)" }} shape="round" onClick={this.toggleScreenSharing} >Show Screen</Button>
	}

	getButton = (label, artifactId) => {

		if (!this.isCoach) {
			return <></>
		}

		if (this.state.isScreenSharing) {
			return <></>
		}

		const shouldDisable = this.state.controlledArtifactId === artifactId;

		if (shouldDisable) {
			return <Button key={artifactId} id={artifactId} disabled={true} shape="round">{label}</Button>
		}

		return <Button key={artifactId} id={artifactId} style={{ background: "black", color: "rgb(44, 147, 209)" }} shape="round" onClick={() => this.toggleArtifact(artifactId)}>{label}</Button>
	}

	/**
	 * to release the controlled artifact
	 * @returns
	 */
	getMagicButton = () => {

		if (!this.isCoach) {
			return <></>;
		}

		if (this.state.isScreenSharing) {
			return <></>
		}

		if (this.state.controlledArtifactId === "none") {
			return <></>
		}

		return (
			<Tooltip title="Release the artifact from the view of a member">
				<Button style={{ background: "black", color: "rgb(44, 147, 209)" }} icon={<UnlockOutlined />} shape="circle" onClick={() => this.toggleArtifact("none")} />
			</Tooltip>
		)
	}

	renderControls = (isPrepared) => {
		return (
			<Row>
				<Col span={6} style={{ textAlign: "left" }}>
				</Col>
				<Col span={12} style={{ textAlign: "center" }}>
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
export default BroadcastWorkbench;


