/**
 * Wrapper for RTC Peer Connection, which is a Connection between
 * the local device and the remote peer.
 * 
 */
import MediaDevice from './MediaDevice';
import socket from './socket';
import BaseStreamHandler from './BaseStreamHandler';

const CONFIGURATION = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };

class PeerConnection extends BaseStreamHandler {
  /**
     * When the local ICE agent needs to deliver a message to the other Peer.
     * 
     * @param {String} peerId - ID of the person the local instance wants to call
     */
  constructor(peerId) {
    super();
    this.pc = new RTCPeerConnection(CONFIGURATION);
    
    this.pc.onicecandidate = (event) => socket.emit('call', {
      to: this.peerId,
      candidate: event.candidate
    });

    this.pc.ontrack = (event) => this.emit('peerStream', event.streams[0]);

    this.mediaDevice = new MediaDevice();
    this.peerId = peerId;
  }

  /**
   * Starting the call
   * @param {Boolean} isCaller
   * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
   */
  start(isCaller, config) {
    this.mediaDevice
      .on('stream', (stream) => {
        stream.getTracks().forEach((track) => {
          this.pc.addTrack(track, stream);
        });
        this.emit('localStream', stream);
        if (isCaller) socket.emit('request', { to: this.peerId });
        else this.createOffer();
      })
      .start(config);

    return this;
  }

  /**
   * Stop the call
   * @param {Boolean} isStarter
   */
  stop(isStarter) {
    if (isStarter) {
      socket.emit('end', { to: this.peerId });
    }
    this.mediaDevice.stop();
    this.pc.close();
    this.pc = null;
    this.off();
    return this;
  }

  createOffer() {
    this.pc.createOffer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  createAnswer() {
    this.pc.createAnswer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  getDescription(desc) {
    this.pc.setLocalDescription(desc);
    socket.emit('call', { to: this.peerId, sdp: desc });
    return this;
  }

  /**
   * @param {Object} sdp - Session description
   */
  setRemoteDescription(sdp) {
    const rtcSdp = new RTCSessionDescription(sdp);
    this.pc.setRemoteDescription(rtcSdp);
    return this;
  }

  /**
   * @param {Object} candidate - ICE Candidate
   */
  addIceCandidate(candidate) {
    if (candidate) {
      const iceCandidate = new RTCIceCandidate(candidate);
      this.pc.addIceCandidate(iceCandidate);
    }
    return this;
  }
}

export default PeerConnection;