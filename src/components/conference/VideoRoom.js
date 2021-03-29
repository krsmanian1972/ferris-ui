import Janus from './Janus.js';
import RemoteFeedHandle from './RemoteFeedHandle';
import { rtcServerUrl } from '../stores/APIEndpoints';

var janus = null;
var localPlugin = null;

var mypvtid = null;

class VideoRoom {

	remoteFeedMap = new Map();

	constructor(props, roomListener) {
		this.props = props;
		this.roomListener = roomListener;
	}

	startRoom = () => {

		this.myroom = this.props.params.conferenceId;
		this.opaqueId = this.props.params.sessionUserId;
		this.myusername = this.props.appStore.credentials.username;

		Janus.init({ debug: "error", callback: this.createJanusInstance });
	}

	muteVideo = () => {
		localPlugin && localPlugin.muteVideo();
	}

	unmuteVideo = () => {
		localPlugin && localPlugin.unmuteVideo();
	}

	muteAudio = () => {
		localPlugin && localPlugin.muteAudio();
	}

	unmuteAudio = () => {
		localPlugin && localPlugin.unmuteAudio();
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

			const roomEvent = { status: "attached", rfid: rfid };
			this.roomListener(roomEvent);
		}
		else if (feedEvent.event === "remoteStream") {
			const rfid = feedEvent.rfid;
			const stream = feedEvent.stream;

			const remoteFeed = this.remoteFeedMap.get(rfid);
			if (remoteFeed != null) {
				remoteFeed.stream = stream;
			}

			const roomEvent = { status: "remoteStream", rfid: rfid };
			this.roomListener(roomEvent);
		}
	}

	detachRemoteFeeds = (rfid) => {
		const remoteFeed = this.remoteFeedMap.get(rfid);

		if (remoteFeed != null) {
			this.remoteFeedMap.set(rfid, null);
			remoteFeed.detach();

			const roomEvent = { status: 'detached', rfid: rfid };
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
			},
			error: function (error) {
				me.errorStatus(error);
			},
			onmessage: function (msg, jsep) {
				me.handleVideoRoomMessage(msg);
				me.handleJsep(jsep);
			},
			onlocalstream: function (stream) {
				const roomEvent = { myVideoStream: stream, status: `Active`, isActive: true, type: "local" };
				me.roomListener(roomEvent);
			},
			onremotestream: function (stream) {
				// The publisher stream is sendonly, we don't expect anything here
			},
			oncleanup: function () {
				const roomEvent = { myVideoStream: null, status: 'Done', isActive: false, type: "local" };
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

			mypvtid = msg["private_id"];

			this.publishOwnFeed(true);

			if (msg["publishers"]) {
				const list = msg["publishers"];
				this.subscribeToRemoteFeeds(list);
			}
		}
		else if (event === "destroyed") {
			const roomEvent = { myVideoStream: null, status: 'Done', isActive: false, type: "local" };
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
			const roomEvent = { myVideoStream: null, status: 'Done', isActive: false, type: "local" };
			this.roomListener(roomEvent);
		}
	}

	publishOwnFeed = (useAudio) => {
		let me = this;
		localPlugin.createOffer(
			{
				// Add data:true here if you want to publish datachannels as well
				media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },	// Publishers are sendonly
				success: function (jsep) {
					const publish = { request: "configure", audio: useAudio, video: true };
					localPlugin.send({ message: publish, jsep: jsep });
				},
				error: function (error) {
					Janus.error("WebRTC error:", error);
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
			const videoCodec = feed["video_codec"];

			const remoteFeedHandle = new RemoteFeedHandle(janus, this.opaqueId, mypvtid, this.myroom, this.remoteFeedListener);
			remoteFeedHandle.subscribeTo(feedId, videoCodec);
		}
	}

	unpublishOwnFeed = () => {
		const unpublish = { request: "unpublish" };
		localPlugin.send({ message: unpublish });
	}

	errorStatus = (error) => {
		Janus.error(error);
		const roomEvent = { status: 'Error', message: error, isActive: false };
		this.roomListener(roomEvent);
	}
}

export default VideoRoom;


