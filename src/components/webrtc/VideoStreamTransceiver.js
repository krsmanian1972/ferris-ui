/**
 * Assembly of the Video and Audio Device stream Adapter 
 * and the BasePeerConnection 
 * 
 * 
 * 
 */
import socket from '../stores/socket';
import BasePeerConnection from './BasePeerConnection';
import VideoDeviceAdapter from './VideoDeviceAdapter';

class VideoStreamTransceiver extends BasePeerConnection {

  /**
   * Capture the Stream from the Users Camera and Microphone 
   * and send to the track information to the Peer.
   * 
   * @param {String} peerId 
   * @param {String} connectionKey 
   */
  constructor(peerId, connectionKey) {
    super(peerId, connectionKey);
    this.mediaDevice = new VideoDeviceAdapter();
  }

  onMediaStream = (isCaller,stream) => {
    stream.getTracks().forEach((track) => {
      this.pc.addTrack(track, stream);
    });

    this.emit('localStream', stream);

    if (isCaller) {
      socket.emit('request', { to: this.peerId });
    }
    else {
      this.createOffer();
    }
  }

  /**
   * Starting the call by the Caller and will place the Request
   * 
   */
  start() {
    this.mediaDevice
      .on('stream', (stream) => this.onMediaStream(true, stream))
      .startStreaming();

    return this;
  }

  /**
   * The the Peer is joining the call and will send an Offer
   * 
   * TODO: The config is the Preference by the Peer while joining the
   * call, which is not honoured now.
   */
  join(preference) {
    this.mediaDevice
      .on('stream', (stream) => this.onMediaStream(false, stream))
      .startStreaming();

    return this;
  }
}

export default VideoStreamTransceiver;