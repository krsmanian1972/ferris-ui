import React, { Component } from 'react';
import Janus from './Janus.js';
import { message, Button } from 'antd';

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
var sfutest = null;
var opaqueId = "videoroomtest-" + Janus.randomString(12);

var myroom = 1234;	// Demo room
var myusername = "raja";

var myid = null;
var mypvtid = null;

var doSimulcast = false;
var doSimulcast2 = false;
var subscriber_mode = false;

export default class VideoRoom extends Component {

	remoteFeedMap = new Map();

	constructor(props) {
		super(props);

		this.state = {
			mystream: null,
			status: '',
			message: ''
		}
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
		Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
		Janus.log("  -- This is a publisher/manager");
		const newState = { status: "canRegister", message: 'Plugin attached.' };
		this.setState(newState);
	}

	remoteFeedListener = (feedEvent) => {
		if(!feedEvent) {
			return;
		}
		if (feedEvent.event === "attached") {
			var remoteFeed = feedEvent.remoteFeed;

			var rfid =  remoteFeed.rfid;
			this.remoteFeedMap.set(rfid,remoteFeed);
			
			const newState = {status: "feedAttached",rfid: rfid};
			this.setState(newState);
		}
		else if(feedEvent.event === "remoteStream") {
			var rfid = feedEvent.rfid;
			var stream = feedEvent.stream;

			var remoteFeed = this.remoteFeedMap.get(rfid);
			if(remoteFeed != null) {
				remoteFeed.stream = stream;
			}

			const newState = {status: "streamReceived",rfid: rfid};
			this.setState(newState);
		}
	}

	detachRemoteFeeds = (rfid) => {
		var remoteFeed = this.remoteFeedMap.get(rfid);
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

		var attachCallback = {
			plugin: "janus.plugin.videoroom",
			opaqueId: opaqueId,
			success: function (pluginHandle) {
				sfutest = pluginHandle;
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
		return attachCallback;
	}

	handleJsep = (jsep) => {
		if (!jsep) {
			return;
		}
		
		Janus.debug("Handling SDP as well...", jsep);
		sfutest.handleRemoteJsep({ jsep: jsep });
	}

	auditCodec = (msg) => {
		let mystream = this.state.mystream;

		var audio = msg["audio_codec"];
		if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
			message.warning("Our audio stream has been rejected, viewers won't hear us");
		}

		var video = msg["video_codec"];
		if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
			message.warning("Our video stream has been rejected, viewers won't see us");
		}
	}

	handleVideoRoomMessage = (msg) => {

		var event = msg["videoroom"];

		if (!event) {
			return;
		}

		if (event === "joined") {
			// Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
			myid = msg["id"];
			mypvtid = msg["private_id"];

			Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);

			if (!subscriber_mode) {
				this.publishOwnFeed(true);
			}

			// Any new feed to attach to?
			if (msg["publishers"]) {
				var list = msg["publishers"];
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
			var list = msg["publishers"];
			Janus.debug("Got a list of available publishers/feeds:", list);
	
			this.subscribeToRemoteFeeds(list);
		}
		else if (msg["leaving"]) {
			// One of the publishers has gone away?
			var leaving = msg["leaving"];
			Janus.log("Publisher left: " + leaving);

			this.detachRemoteFeeds(leaving);
		}
		else if (msg["unpublished"]) {
			// One of the publishers has unpublished?
			var unpublished = msg["unpublished"];
			Janus.log("Publisher left: " + unpublished);

			if (unpublished === 'ok') {
				// That's us
				sfutest.hangup();
				return;
			}

			this.detachRemoteFeeds(unpublished);
		}
		else if (msg["error"]) {
			if (msg["error_code"] === 426) {
				// This is a "no such room" error: give a more meaningful description
				message.error(
					"<p>Apparently room <code>" + myroom + "</code> (the one this demo uses as a test room) " +
					"does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
					"configuration file? If not, make sure you copy the details of room <code>" + myroom + "</code> " +
					"from that sample in your current configuration file, then restart Janus and try again."
				);
			}
			else {
				message.error(msg["error"]);
			}
		}
	}

	publishOwnFeed = (useAudio) => {
		var me = this;
		sfutest.createOffer(
			{
				// Add data:true here if you want to publish datachannels as well
				media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },	// Publishers are sendonly
				simulcast: doSimulcast,
				simulcast2: doSimulcast2,
				success: function (jsep) {
					Janus.debug("Got publisher SDP!", jsep);
					var publish = { request: "configure", audio: useAudio, video: true };
					sfutest.send({ message: publish, jsep: jsep });
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

		for (var key in givenFeeds) {
			var feed = givenFeeds[key];

			console.log(feed);

			var feedId = feed["id"];
			var display = feed["display"];
			var audio_codec = feed["audio_codec"];
			var video_codec = feed["video_codec"];

			const remoteFeedHandle = new RemoteFeedHandle(janus, opaqueId, mypvtid, myroom, this.remoteFeedListener);
			remoteFeedHandle.subscribeTo(feedId, display, audio_codec, video_codec);
		}
	}

	unpublishOwnFeed = () => {
		var unpublish = { request: "unpublish" };
		sfutest.send({ message: unpublish });
	}

	toggleMute = () =>{
		var muted = sfutest.isAudioMuted();
		Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
		if (muted)
			sfutest.unmuteAudio();
		else
			sfutest.muteAudio();
		muted = sfutest.isAudioMuted();
	}
	
	errorStatus = (error) => {
		Janus.error(error);
		const newState = { status: "error", message: error };
		this.setState(newState);
	}

	startButton = () => {
		if (janus) {
			return <></>
		}
		return (
			<Button key="init" onClick={this.startClicked}>Start</Button>
		)
	}

	startClicked = () => {
		Janus.init({ debug: "all", callback: this.createJanusInstance });
	}

	registrationButton = () => {
		if (this.state.status === 'canRegister') {
			return (
				<Button key="registration" onClick={this.registerClicked} >Register</Button>
			)
		}
	}

	registerClicked = () => {

		const newState = { status: "registered", message: 'Registered' };
		this.setState(newState);

		var register = {
			request: "join",
			room: myroom,
			ptype: "publisher",
			display: myusername
		};

		sfutest.send({ message: register });
	}

	render() {

		const viewHeight = window.innerHeight * 0.50;
		const { mystream } = this.state;

		return (
			<div style={{ padding: 2, height: viewHeight }}>
				<div>
					{this.startButton()}
					{this.registrationButton()}
				</div>
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



