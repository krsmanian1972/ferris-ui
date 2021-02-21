import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Row, Col, Space, Button, Tooltip, Tag } from 'antd';
import { ShareAltOutlined, CameraOutlined, AudioOutlined, StopOutlined, BookOutlined, AudioMutedOutlined, EyeInvisibleOutlined, CompressOutlined, ExpandOutlined, CodepenOutlined } from '@ant-design/icons';

import NoteListStore from '../stores/NoteListStore';
import NotesStore from '../stores/NotesStore';
import NotesDrawer from '../commons/NotesDrawer';

import Board from '../commons/Board';

import VideoRoom from './VideoRoom';
import Screencast from './Screencast';
import VideoPanel from './VideoPanel';
import ArtifactPanel from './ArtifactPanel';

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
			isScreenActive: false,
			isPrepared:false,

			status: '',
			screenStatus: '',

			message: '',

			videoDevice: 'On',
			audioDevice: 'On',
			isMinimized: false,

			isScreenSharing: false,

			portalSize: { height: window.innerHeight, width: window.innerWidth }
		}
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
			return "Turn-off the Camera";
		}
		return "Turn-on the Camera";
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

		const { myVideoStream, portalSize, isMinimized, isActive } = this.state;

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
						{this.renderArtifacts()}
					</div>
				</div>
				{this.renderControls(isActive)}
				{this.opaqueId && <NotesDrawer notesStore={this.notesStore} />}
			</div>
		)
	}

	getShareScreenTooltip = () => {
		if (!this.state.isScreenSharing) {
			return "Start Screen Sharing";
		}
		return "Stop Screen Sharing";
	}

	getShareScreenIcon = () => {
		if (!this.state.isScreenSharing) {
			return <ShareAltOutlined />;
		}
		return <StopOutlined />;
	}

	toggleScreenSharing = () => {
		if (!this.state.isScreenSharing) {
			this.setState({ isScreenSharing: true});
			this.screencast.startScreenSharing();
			return;
		}

		this.setState({ isScreenSharing: false});
		this.screencast.stopSharing();
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
	 * Canvas Sharing will supersede Screen Sharing.
	 * 
	 */
	renderArtifacts = () => {
		const { isScreenSharing, myScreenStream,isPrepared } = this.state;

		if (!isScreenSharing && isPrepared) {
			return (
				<div className="activeItem">
	
				</div>
			)
		}

		return (
			<>
				{this.getPeerScreens().map(value => value)}
				{myScreenStream && <ArtifactPanel key="localScreen" stream={myScreenStream} username={this.myusername} />}
			</>
		)
	}

	renderControls = (isActive) => {

		return (
			<Row style={{ marginTop: 8 }}>
				<Col span={12} style={{ textAlign: "left" }}>
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
						<Tag key="stat_tg" color="#108ee9">{this.state.status}</Tag>
					</Space>
				</Col>
				<Col span={6}>
					<Space>
						<Tooltip key="screen_tp" title={this.getShareScreenTooltip()}>
							<Button key="screen_bt" disabled={!isActive} id="screenShare" type="primary" icon={this.getShareScreenIcon()} shape="circle" onClick={this.toggleScreenSharing} />
						</Tooltip>
						<Tag key="screen_tag_tp" color="#108ee9">{this.state.screenStatus}</Tag>
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


