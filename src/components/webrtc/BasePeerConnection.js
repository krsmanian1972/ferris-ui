/**
 * Objective:
 * ---------- 
 * This class will be inherited by all the future Transceivers
 * like, ScreenStreamTransceiver and VideoStreamTranceiver.
 * 
 * Being, the class is a composition of  the RTCPeerConnection 
 * it is primarily responsible for emitting the data to 
 * through the OnTrackEvent. 
 * 
 * This class provides the implementation of the methods
 * required to complete the typical RTC negotiation
 * request->offer-answer 
 * 
 * This negotiation protocol can be reused by the implementation
 * classes (xxxTransceivers)
 * 
 */
import socket from '../stores/socket';
import BaseStreamHandler from './BaseStreamHandler';

const CONFIGURATION = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };

class BasePeerConnection extends BaseStreamHandler {

  /**
   * The Token ID of the Peer.
   * 
   * @param {string} peerId  => The Token ID of the Peer
   * 
   * @param {string} connectionKey => The Key of the Callback event
   * when a stream is available through the onTrackEvent 
   * of the RTCPeerConnection
   * 
   */
  constructor(peerId, connectionKey) {

    super();

    this.pc = new RTCPeerConnection(CONFIGURATION);
    this.peerId = peerId;
    this.connectionKey = connectionKey;

    this.pc.onicecandidate = (event) => {
      socket.emit('call', { to: this.peerId, connectionKey: this.connectionKey, candidate: event.candidate })
    };

    this.pc.ontrack = (event) => {
      this.emit(connectionKey, event.streams[0]);
    };
  }

  /**
   * Offer is the response from the Peer to a Callers Request
   */
  createOffer() {
    this.pc.createOffer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  /**
   * Answer is the response to the Offer from the Peer 
   */
  createAnswer() {
    this.pc.createAnswer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  /**
   * Both the Offer and Answer method binds this method to
   * dispatch the description to the Socket (Ferex)
   * @param {*} desc 
   */
  getDescription(desc) {
    this.pc.setLocalDescription(desc);
    socket.emit('call', { to: this.peerId, sdp: desc, connectionKey: this.connectionKey });
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

export default BasePeerConnection;