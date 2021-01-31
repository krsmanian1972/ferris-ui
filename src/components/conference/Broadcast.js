import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Janus from './Janus.js';
import { message } from 'antd';

import VideoPanel from './VideoPanel';
import RemoteFeedHandle from './RemoteFeedHandle';
import {rtcServerUrl} from '../stores/APIEndpoints';

const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#646464",
    position: "relative",
    overflow: "hidden",
};

var janus = null;
var localPlugin = null;

var myid = null;
var mypvtid = null;

var doSimulcast = false;
var doSimulcast2 = false;
var subscriberMode = false;

@inject("appStore")
@observer
class Broadcast extends Component {

	remoteFeedMap = new Map();

	constructor(props) {
		super(props);

		this.state = {
			mystream: null,
			status: '',
			message: '',
			portalSize: { height: window.innerHeight, width: window.innerWidth }
		}
	}

	componentDidMount() {

		window.addEventListener("resize", () => {
            const portalSize = { height: window.innerHeight, width: window.innerWidth };
            this.setState({ portalSize: portalSize });
		});
		
		this.auditUser();
	}

	auditUser = async() => {

		this.myroom = this.props.params.conferenceId;
		this.opaqueId = this.props.params.sessionUserId;
		this.myusername = this.props.appStore.credentials.username;
		
		Janus.init({ debug: "all", callback: this.createJanusInstance });
	}

	/**
	 * Callback method for Janus.init
	 * Create Janus instance upon successfull Janus.init
	 */
	createJanusInstance = () => {

		let me = this;

		// Create session with Gateway callbacks
		janus = new Janus({
			server: rtcServerUrl,
			success: function () {
				janus.attach(me.createPublisherCallback());
			},
			error: function (error) {
				me.errorStatus(error);
			},
			destroyed: function () {
				window.location.reload();
			}
		});
	}

	doRegister = () => {
		const register = {
			request: "join",
			room: this.myroom,
			ptype: "publisher",
			display: this.myusername
		};

		localPlugin.send({ message: register });
	}

	remoteFeedListener = (feedEvent) => {
		if(!feedEvent) {
			return;
		}
		if (feedEvent.event === "attached") {
			const remoteFeed = feedEvent.remoteFeed;

			const rfid =  remoteFeed.rfid;
			this.remoteFeedMap.set(rfid,remoteFeed);
			
			const newState = {status: "feedAttached",rfid: rfid};
			this.setState(newState);
		}
		else if(feedEvent.event === "remoteStream") {
			const rfid = feedEvent.rfid;
			const stream = feedEvent.stream;

			const remoteFeed = this.remoteFeedMap.get(rfid);
			if(remoteFeed != null) {
				remoteFeed.stream = stream;
			}

			const newState = {status: "streamReceived",rfid: rfid};
			this.setState(newState);
		}
	}

	detachRemoteFeeds = (rfid) => {
		const remoteFeed = this.remoteFeedMap.get(rfid);
		if (remoteFeed != null) {
			Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
			this.remoteFeedMap.set(rfid,null);
			remoteFeed.detach();

			const newState = {status: "feedDetached",rfid: rfid};
			this.setState(newState);
		}
	}

	createPublisherCallback = () => {

		let me = this;

		const streamCallback = {
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: function (pluginHandle) {
				localPlugin = pluginHandle;
				me.doRegister();
			},
			error: function (error) {
				Janus.error("  -- Error attaching plugin...", error);
			},
			consentDialog: function (on) {
				Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
			},
			iceState: function (state) {
				Janus.log("ICE state changed to " + state);
			},
			mediaState: function (medium, on) {
				Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
			},
			webrtcState: function (on) {
				Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
			},
			onmessage: function (msg, jsep) {
				Janus.debug(" ::: Got a message (publisher) :::", msg);
				me.handleVideoRoomMessage(msg);
				me.handleJsep(jsep);
				me.auditCodec(msg);
			},
			onlocalstream: function (stream) {
				Janus.debug(" ::: Got a local stream :::", stream);
				const newState = { mystream: stream };
				me.setState(newState);
			},
			onremotestream: function (stream) {
				// The publisher stream is sendonly, we don't expect anything here
			},
			oncleanup: function () {
				Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
				const newState = { mystream: null };
				me.setState(newState);
			}
		};
		return streamCallback;
	}

	handleJsep = (jsep) => {
		if (!jsep) {
			return;
		}
		
		Janus.debug("Handling SDP as well...", jsep);
		localPlugin.handleRemoteJsep({ jsep: jsep });
	}

	auditCodec = (msg) => {
		const mystream = this.state.mystream;

		const audio = msg["audio_codec"];
		if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
			message.warning("Our audio stream has been rejected, viewers won't hear us");
		}

		const video = msg["video_codec"];
		if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
			message.warning("Our video stream has been rejected, viewers won't see us");
		}
	}

	handleVideoRoomMessage = (msg) => {

		const event = msg["videoroom"];

		if (!event) {
			return;
		}

		if (event === "joined") {
			// Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
			myid = msg["id"];
			mypvtid = msg["private_id"];

			Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);

			if (!subscriberMode) {
				this.publishOwnFeed(true);
			}

			// Any new feed to attach to?
			if (msg["publishers"]) {
				const list = msg["publishers"];
				Janus.debug("Got a list of available publishers/feeds:", list);

				this.subscribeToRemoteFeeds(list);
			}
		}
		else if (event === "destroyed") {
			// The room has been destroyed
			Janus.warn("The room has been destroyed!");
			message.error("The room has been destroyed", function () {
				window.location.reload();
			});
		}
		else if (event === "event") {
			this.onRtcEvent(msg);
		}
	}

	onRtcEvent = (msg) => {
		if (msg["publishers"]) {
			// Any new feed to attach to?
			const list = msg["publishers"];
			Janus.debug("Got a list of available publishers/feeds:", list);
	
			this.subscribeToRemoteFeeds(list);
		}
		else if (msg["leaving"]) {
			// One of the publishers has gone away?
			const leaving = msg["leaving"];
			Janus.log("Publisher left: " + leaving);

			this.detachRemoteFeeds(leaving);
		}
		else if (msg["unpublished"]) {
			// One of the publishers has unpublished?
			const unpublished = msg["unpublished"];
			Janus.log("Publisher left: " + unpublished);

			if (unpublished === 'ok') {
				// That's us
				localPlugin.hangup();
				return;
			}

			this.detachRemoteFeeds(unpublished);
		}
		else if (msg["error"]) {
			if (msg["error_code"] === 426) {
				// This is a "no such room" error: give a more meaningful description
				message.error(
					"<p>Apparently room <code>" + this.myroom + "</code> (the one this demo uses as a test room) " +
					"does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
					"configuration file? If not, make sure you copy the details of room <code>" + this.myroom + "</code> " +
					"from that sample in your current configuration file, then restart Janus and try again."
				);
			}
			else {
				message.error(msg["error"]);
			}
		}
	}

	publishOwnFeed = (useAudio) => {
		let me = this;
		localPlugin.createOffer(
			{
				// Add data:true here if you want to publish datachannels as well
				media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },	// Publishers are sendonly
				simulcast: doSimulcast,
				simulcast2: doSimulcast2,
				success: function (jsep) {
					Janus.debug("Got publisher SDP!", jsep);
					const publish = { request: "configure", audio: useAudio, video: true };
					localPlugin.send({ message: publish, jsep: jsep });
				},
				error: function (error) {
					Janus.error("WebRTC error:", error);
					message.error(error);
					if (useAudio) {
						me.publishOwnFeed(false);
					}
				}
			});
	}

	subscribeToRemoteFeeds = (givenFeeds) => {

		for (let key in givenFeeds) {
			const feed = givenFeeds[key];
			
			const feedId = feed["id"];
			const display = feed["display"];
			const audio_codec = feed["audio_codec"];
			const video_codec = feed["video_codec"];

			const remoteFeedHandle = new RemoteFeedHandle(janus, this.opaqueId, mypvtid, this.myroom, this.remoteFeedListener);
			remoteFeedHandle.subscribeTo(feedId, display, audio_codec, video_codec);
		}
	}

	unpublishOwnFeed = () => {
		const unpublish = { request: "unpublish" };
		localPlugin.send({ message: unpublish });
	}

	toggleMute = () =>{
		const muted = localPlugin.isAudioMuted();
		Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
		if (muted) {
			localPlugin.unmuteAudio();
		}
		else {
			localPlugin.muteAudio();
		}
	}
	
	errorStatus = (error) => {
		Janus.error(error);
		const newState = { status: "error", message: error };
		this.setState(newState);
	}

	render() {

		const { mystream,portalSize } = this.state;
		const viewHeight = portalSize.height * 0.94;

		return (
			<div style={{ padding: 2, height: viewHeight }}>
				<div style={standardStyle} >
					<div className="peerVideoContainer" style={{height: "15%"}}>
						{this.getPeerVideos().map(value => value)}
					</div>
					<div className="myVideoContainer" style={{ height: "15%" }}>
						<VideoPanel key="local" stream={mystream} muted={true}/>
					</div>
				</div>
			</div>
		)
	}


    getPeerVideos = () => {
        const peerVideos = [];

        for (const [key, remoteFeed] of this.remoteFeedMap) {
			if(remoteFeed) {
            	const el = <VideoPanel key={key} stream={remoteFeed.stream} muted={false}/>
				peerVideos.push(el);
			}
        }

        return peerVideos;
    }

}

export default Broadcast; 


