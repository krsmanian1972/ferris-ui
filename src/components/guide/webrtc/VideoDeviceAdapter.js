import _ from 'lodash';
import BaseStreamHandler from './BaseStreamHandler';

/**
 * To emit streams from the User Media devices namely 
 * the Camera and Audio.
 * 
 * The Listener shall attach a callback, using the On Method of
 * the BaseStreamHandler.
 *  
 */
class VideoDeviceAdapter extends BaseStreamHandler {
    
    /**
     * Start the media devices and send stream.
     * The emitted stream will be leveraged by the Listener
     */
    startStreaming() {
        const constraints = {
            video: {
                facingMode: 'user',
                height: { min: 360, ideal: 720, max: 1080 }
            },
            audio: true
        };

        navigator
            .mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                this.stream = stream;
                this.emit('stream', stream);
            })
            .catch((err) => {
                if (err instanceof DOMException) {
                    alert('Unable to open the user media device like webcam and/or microphone');
                } else {
                    console.log(err);
                }
            });

        return this;
    }

    /**
     * Turn on/off a device
     * @param {String} type - Type of the device
     * @param {Boolean} [on] - State of the device
     */
    toggle(type, on) {
        const len = arguments.length;
        if (this.stream) {
            this.stream[`get${type}Tracks`]().forEach((track) => {
                const state = len === 2 ? on : !track.enabled;
                _.set(track, 'enabled', state);
            });
        }
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

export default VideoDeviceAdapter;