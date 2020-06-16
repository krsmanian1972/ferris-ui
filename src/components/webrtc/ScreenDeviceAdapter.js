import _ from 'lodash';
import BaseStreamHandler from './BaseStreamHandler';

/**
 * To capture the stream from the Display Media.
 * 
 * The startStreaming method will emit the screen stream.
 * 
 * The Listener for the "stream" shall take the required action.
 * 
 * The Listener shall register a callback using the OnMethod to 
 * receive the stream.
 */
class ScreenDeviceAdapter extends BaseStreamHandler {

    startStreaming() {
        navigator
            .mediaDevices
            .getDisplayMedia({audio:true,video:true})
            .then((screenStream) => {
                this.stream = screenStream;
                this.emit('stream', screenStream);
            })
            .catch((err) => {
                if (err instanceof DOMException) {
                    alert('Cannot start screen capture');
                } else {
                    console.log(err);
                }
            });

        return this;
    }
   
    /**
     * Stop all media track of devices
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
        }
        return this;
    }
}

export default ScreenDeviceAdapter;