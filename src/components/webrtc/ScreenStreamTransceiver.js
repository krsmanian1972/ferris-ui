/**
 * Assembly of the ScreenDevice Adapter and BasePeerConnection 
 */

import BasePeerConnection from './BasePeerConnection';
import ScreenDeviceAdapter from './ScreenDeviceAdapter';

/**
 * Transmission:
 * -------------
 * Capture the Screen stream and transmit the tracks of the streams to 
 * the underlying Peer Connection. This is the purpose of onMediaStream.
 * 
 * Receiving: 
 * ----------
 * When another instance, created at the Peers Browser, sends the screen 
 * stream as tracks, the onTrackEvent hook will be provided with the stream data. 
 *
 * Plese remember that the track event will happen at the Peer side.
 * 
 */
class ScreenStreamTransceiver extends BasePeerConnection {

  constructor(peerId, connectionKey) {
    super(peerId, connectionKey);

    this.mediaDevice = new ScreenDeviceAdapter();
  }

  onMediaStream = (stream) => {
    stream.getTracks().forEach((track) => {
      this.pc.addTrack(track, stream);
    });

    this.emit('localStream', stream);

    this.createOffer();
  }
  /**
   * Starting the streaming of the screen to the peer.
   * 
   */
  start() {
    this.mediaDevice
      .on('stream', (stream) => this.onMediaStream(stream))
      .startStreaming();
    return this;
  }
}

export default ScreenStreamTransceiver;