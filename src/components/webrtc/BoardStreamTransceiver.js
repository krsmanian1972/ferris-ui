/**
 * Assembly of the ScreenDevice Adapter and BasePeerConnection 
 */

import BasePeerConnection from './BasePeerConnection';


/**
 * Transmission:
 * -------------
 * The Canvas stream as offered by the Board 
 * will be piped into the Peer Connection
 * 
 */
class BoardStreamTransceiver extends BasePeerConnection {

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
  start(stream) {
    if(stream) {
      this.onMediaStream(stream);
    }
    return this;
  }
}

export default BoardStreamTransceiver;