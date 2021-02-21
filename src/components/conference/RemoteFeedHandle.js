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

	/**
	 * 
	 * @param {*} feedId 
	 * @param {*} video_codec 
	 */
	subscribeTo = (feedId, video_codec) => {

		let me = this;

		this.janus.attach(
			{
				plugin: "janus.plugin.videoroom",
				opaqueId: me.opaqueId,
				success: function (pluginHandle) {
					me.remoteFeed = pluginHandle;
					const subscription = me.videoSubscription(feedId, video_codec);
					me.remoteFeed.send({ message: subscription });
				},
				error: function (error) {
					Janus.error("  -- Error attaching plugin...", error);
				},
				onmessage: function (msg, jsep) {
					me.handleJoiningMessage(msg);
					me.handleJsep(jsep);
				},
				onlocalstream: function (stream) {
					// The subscriber stream is recvonly, we don't expect anything here
				},
				onremotestream: function (stream) {
					const feedEvent = {
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

	videoSubscription = (feedId, video_codec) => {

		const subscription = {
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

		const event = msg["videoroom"];
		if (!event) {
			return
		}

		if (event === "attached") {
			this.remoteFeed.rfid = msg["id"];
			this.remoteFeed.rfdisplay = msg["display"];

			const feedEvent = {
				event:"attached",
				remoteFeed: this.remoteFeed 
			}

			this.feedListener(feedEvent);
	
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

		const remoteFeed = this.remoteFeed;
		const room = this.myroom;

		// Answer and attach
		remoteFeed.createAnswer({
			jsep: jsep,

			media: { audioSend: false, videoSend: false },

			success: function (jsep) {
				const answer = { request: "start", room: room };
				remoteFeed.send({ message: answer, jsep: jsep });
			},
			error: function (error) {
				Janus.error("WebRTC error:", error);
			}
		});
	}
}

export default RemoteFeedHandle;