/**  When a new feed has been published, create a new plugin handle 
 * and attach to it as a subscriber
*/

import Janus from './Janus.js';

class RemoteFeedHandle {

	janus = null;
	opaqueId = null;
	mypvtid = null;
	myroom = null;

	remoteFeed = null;

	feedListener = null;

	constructor(janus, opaqueId, mypvtid, myroom, feedListener) {

		this.janus = janus;
		this.opaqueId = opaqueId;
		this.mypvtid = mypvtid;
		this.myroom = myroom;

		this.feedListener = feedListener;
	}


	subscribeTo = (feedId, display, audio_codec, video_codec) => {

		var me = this;

		this.janus.attach(
			{
				plugin: "janus.plugin.videoroom",
				opaqueId: me.opaqueId,
				success: function (pluginHandle) {
					Janus.log("Plugin attached! (" + pluginHandle.getPlugin() + ", id=" + pluginHandle.getId() + ")");
					Janus.log("  -- This is a subscriber");

					me.remoteFeed = pluginHandle;
					me.remoteFeed.simulcastStarted = false;
					const subscription = me.createSubscription(feedId, display, audio_codec, video_codec);
					me.remoteFeed.send({ message: subscription });

				},
				error: function (error) {
					Janus.error("  -- Error attaching plugin...", error);
				},
				onmessage: function (msg, jsep) {
					Janus.debug(" ::: Got a message (subscriber) :::", msg);

					me.handleJoiningMessage(msg);
					me.handleJsep(jsep);
				},
				iceState: function (state) {
					Janus.log("ICE state of this WebRTC PeerConnection (feed #" + me.remoteFeed.rfindex + ") changed to " + state);
				},
				webrtcState: function (on) {
					Janus.log("Janus says this WebRTC PeerConnection (feed #" + me.remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
				},
				onlocalstream: function (stream) {
					// The subscriber stream is recvonly, we don't expect anything here
				},
				onremotestream: function (stream) {
					Janus.debug("Remote feed #" + me.remoteFeed.rfid + ", stream:", stream);

					var feedEvent = {
						event:"remoteStream",
						rfid: me.remoteFeed.rfid,
						stream:stream,	
					}

					me.feedListener(feedEvent);
				},
				oncleanup: function () {
					Janus.log(" ::: Got a cleanup notification (remote feed " + feedId + ") :::");
				}
			}
		)
	}

	createSubscription = (feedId, display, audio_codec, video_codec) => {

		// We wait for the plugin to send us an offer
		var subscription = {
			request: "join",
			room: this.myroom,
			ptype: "subscriber",
			feed: feedId,
			private_id: this.mypvtid
		};

		if (Janus.webRTCAdapter.browserDetails.browser === "safari" && (video_codec === "vp9" || (video_codec === "vp8" && !Janus.safariVp8))) {
			if (video_codec) {
				video_codec = video_codec.toUpperCase();
			}
			subscription["offer_video"] = false;
		}

		this.remoteFeed.videoCodec = video_codec;

		return subscription;
	}

	handleJoiningMessage = (msg) => {

		if (msg["error"]) {
			return;
		}

		var event = msg["videoroom"];
		Janus.debug("Event: " + event);
		if (!event) {
			return
		}

		if (event === "attached") {
			this.remoteFeed.rfid = msg["id"];
			this.remoteFeed.rfdisplay = msg["display"];

			var feedEvent = {
				event:"attached",
				remoteFeed: this.remoteFeed 
			}

			this.feedListener(feedEvent);
	
			Janus.log("Successfully attached to feed " + this.remoteFeed.rfid + " (" + this.remoteFeed.rfdisplay + ") in room " + msg["room"]);
		} else if (event === "event") {
			// Nothing to handle for event
		} else {
			// What has just happened?
		}
	}

	handleJsep = (jsep) => {
		if (!jsep) {
			return;
		}
		
		var remoteFeed = this.remoteFeed;
		var room = this.myroom;

		// Answer and attach
		remoteFeed.createAnswer({
			jsep: jsep,

			// Add data:true here if you want to subscribe to datachannels as well
			// (obviously only works if the publisher offered them in the first place)

			media: { audioSend: false, videoSend: false },	// We want recvonly audio/video

			success: function (jsep) {
				Janus.debug("Got SDP!", jsep);

				var body = { request: "start", room: room };
				remoteFeed.send({ message: body, jsep: jsep });
			},
			error: function (error) {
				Janus.error("WebRTC error:", error);
			}
		});
	}
}

export default RemoteFeedHandle;