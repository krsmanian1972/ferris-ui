import Janus from './Janus.js';
import RemoteFeedHandle from './RemoteFeedHandle';
import { rtcServerUrl } from '../stores/APIEndpoints';

var janus = null;
var localPlugin = null;
var myid = null;
var mypvtid = null;

const LISTENER = "listener";
const SCREEN_PUBLISHER = "screen_publisher";
const STREAM_PUBLISHER = "stream_publisher";

class Screencast {

	remoteFeedMap = new Map();

	constructor(props, roomListener) {
		this.props = props;
		this.roomListener = roomListener;
		this.role = LISTENER;
	}


	/**
	 * Let us assume that a room to show our screen is already provisioned.
	 * 
	 * The number of active publishers to the room is set to two.
	 * 
	 * Join the screen sharing room as Publisher
	 * 
	 * Inform the room id to all our conference peers
	 * 
	*/
	prepare = () => {

		this.myroom = `scr-${this.props.params.conferenceId}`;
		this.opaqueId = this.props.params.sessionUserId;
		this.myusername = this.props.appStore.credentials.username;
		this.role = LISTENER;

		Janus.init({ debug: "error", callback: this.createJanusInstance });
	}

	/**
	  * The role may be either publisher or listener.
	  */
	startScreenSharing = () => {
		this.role = SCREEN_PUBLISHER;
		this.publishScreen();
	}

	startCanvasSharing = (canvasStream) => {
		this.role = STREAM_PUBLISHER;
		this.canvasStream = canvasStream;
		this.publishCanvas();
	}

	/**
	 * Let us simply send a unpublish signal to the Janus server
	 */
	stopSharing = () => {
		this.role = LISTENER;
		this.unpublishOwnFeed();
	}

	/**
	 * Callback method for Janus.init
	 * Create Janus instance upon successfull Janus.init
	 */
	createJanusInstance = () => {

		let me = this;

		// Create session with the prescribed Janu Gateway callbacks
		janus = new Janus({
			server: rtcServerUrl,
			success: function () {
				janus.attach(me.createPublisherCallback());
			},
			error: function (error) {
				me.errorStatus(error);
			},
		});
	}

	/**
	 * The Remote Feed Listener re-dispatches the feedEvents to the roomEvent Listener.
	 * We need to register the remoteFeedListener to the RemoteFeedHandler.
	 * 
	 * @param {*} feedEvent 
	 */
	remoteFeedListener = (feedEvent) => {
		if (!feedEvent) {
			return;
		}

		if (feedEvent.event === "attached") {
			const remoteFeed = feedEvent.remoteFeed;

			const rfid = remoteFeed.rfid;
			this.remoteFeedMap.set(rfid, remoteFeed);

			const displayName = remoteFeed.rfdisplay;
			const roomEvent = { screenStatus: `${displayName} Screen`, rfid: rfid };
			this.roomListener(roomEvent);
		}
		else if (feedEvent.event === "remoteStream") {
			const rfid = feedEvent.rfid;
			const stream = feedEvent.stream;

			const remoteFeed = this.remoteFeedMap.get(rfid);
			if (remoteFeed != null) {
				remoteFeed.stream = stream;
			}

			const displayName = remoteFeed.rfdisplay;
			const roomEvent = { screenStatus: `${displayName} Rendering`, rfid: rfid };
			this.roomListener(roomEvent);
		}
	}

	detachRemoteFeeds = (rfid) => {
		const remoteFeed = this.remoteFeedMap.get(rfid);

		if (remoteFeed != null) {
			this.remoteFeedMap.set(rfid, null);
			remoteFeed.detach();

			const displayName = remoteFeed.rfdisplay;
			const roomEvent = { screenStatus: `${displayName} Closed`, rfid: rfid };
			this.roomListener(roomEvent);
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
				const roomEvent = { isScreenActive: true, isPrepared: true, screenStatus: 'Registered' }
				me.roomListener(roomEvent);
			},
			error: function (error) {
				me.errorStatus(error);
			},
			onmessage: function (msg, jsep) {
				me.handleVideoRoomMessage(msg);
				me.handleJsep(jsep);
			},
			onlocalstream: function (stream) {
				const roomEvent = { myScreenStream: stream, isScreenActive: true, screenStatus: `Showing my screen` };
				me.roomListener(roomEvent);
			},
			onremotestream: function (stream) {
				// The publisher stream is sendonly, we don't expect anything here
			},
			oncleanup: function () {
				const roomEvent = { myScreenStream: null, isScreenActive: false, screenStatus: 'Done' };
				me.roomListener(roomEvent);
			}
		};
		return streamCallback;
	}

	doRegister = () => {
		const register = {
			request: "join",
			ptype: "publisher",
			room: this.myroom,
			display: this.myusername
		};

		localPlugin.send({ message: register });
	}

	handleJsep = (jsep) => {
		if (!jsep) {
			return;
		}
		localPlugin.handleRemoteJsep({ jsep: jsep });
	}

	handleVideoRoomMessage = (msg) => {

		const event = msg["videoroom"];

		if (!event) {
			return;
		}

		if (event === "joined") {

			myid = msg["id"];
			mypvtid = msg["private_id"];

			if (this.role === SCREEN_PUBLISHER) {
				this.publishScreen();
			}
			else if(this.role === STREAM_PUBLISHER) {
				this.publishCanvas();
			}
			else {
				if (msg["publishers"]) {
					const list = msg["publishers"];
					this.subscribeToRemoteFeeds(list);
				}
			}
		}
		else if (event === "destroyed") {
			const roomEvent = { myScreenStream: null, isScreenActive: false, screenStatus: 'Done' };
			this.roomListener(roomEvent);
		}
		else if (event === "event") {
			this.onRtcEvent(msg);
		}
	}

	onRtcEvent = (msg) => {
		if (msg["publishers"]) {
			const list = msg["publishers"];
			this.subscribeToRemoteFeeds(list);
		}
		else if (msg["leaving"]) {
			const leaving = msg["leaving"];
			this.detachRemoteFeeds(leaving);
		}
		else if (msg["unpublished"]) {
			const unpublished = msg["unpublished"];
			if (unpublished === 'ok') {
				localPlugin.hangup();
				return;
			}
			this.detachRemoteFeeds(unpublished);
		}
		else if (msg["error"]) {
			const roomEvent = { myScreenStream: null, isScreenActive: false, screenStatus: 'Done', isScreenSharing: false };
			this.roomListener(roomEvent);
		}
	}

	publishScreen = () => {
		if (!localPlugin) {
			return;
		}

		let me = this;
		localPlugin.createOffer(
			{

				media: { video: "screen", audioSend: true, videoRecv: false },
				success: function (jsep) {
					const publish = { request: "configure", audio: true, video: true };
					localPlugin.send({ message: publish, jsep: jsep });
				},
				error: function (error) {
					Janus.error("WebRTC error:", error);
					me.errorStatus(error);
				}
			});
	}

	publishCanvas = () => {

		if (!localPlugin) {
			return;
		}
		let me = this;
		localPlugin.createOffer(
			{
				stream: this.canvasStream,
				media: { video: "canvas", audioSend: true, videoRecv: true },
				success: function (jsep) {
					const publish = { request: "configure", audio: true, video: true };
					localPlugin.send({ message: publish, jsep: jsep });
				},
				error: function (error) {
					Janus.error("WebRTC error:", error);
					me.errorStatus(error);
				}
			});
	}

	subscribeToRemoteFeeds = (givenFeeds) => {

		for (let key in givenFeeds) {
			const feed = givenFeeds[key];

			const feedId = feed["id"];
			const videoCodec = feed["video_codec"];

			const remoteFeedHandle = new RemoteFeedHandle(janus, this.opaqueId, mypvtid, this.myroom, this.remoteFeedListener);
			remoteFeedHandle.subscribeTo(feedId, videoCodec);
		}
	}

	unpublishOwnFeed = () => {
		if (!localPlugin) {
			return;
		}
		const unpublish = { request: "unpublish" };
		localPlugin.send({ message: unpublish });
	}

	errorStatus = (error) => {
		Janus.error(error);
		const roomEvent = { screenStatus: '', message: error, isScreenActive: false, isScreenSharing: false };
		this.roomListener(roomEvent);
	}
}

export default Screencast;


