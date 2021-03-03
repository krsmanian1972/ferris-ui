import Janus from './Janus.js';
import { rtcServerUrl } from '../stores/APIEndpoints';

export default class JanusStore {

    constructor(props) {
        this.apiProxy = props.apiProxy;
        Janus.init({ debug: "all", callback: this.gatewayCallback });
    }

    /**
     * Provision a Video Room to allow 10 active users and a Room for
     * rendering the screen sharing session with two publishers;
     * 
     * @param {*} conferenceId 
     */
    provisionRooms = (conferenceId) => {
        const message = { 
            request: "create", 
            room: conferenceId, 
            publishers: 10 
        };

        this.janusHandle.send({ message: message });

        this.provisionScreenRooms(conferenceId);
    }

    provisionScreenRooms = (conferenceId) => {
        const message = {
            request: "create",
            room: `scr-${conferenceId}`,
            publishers: 6,
            bitrate: 500000,
        };

        this.janusHandle.send({ message: message });
    }

    /**
     * Destroy both the video and screen sharing rooms created for the conference
     * 
     * @param {*} conferenceId 
     */
   
    removeRooms = (conferenceId) => {
        const videoRoomMsg = { request: "destroy", room: conferenceId };
        this.janusHandle.send({ message: videoRoomMsg });

        const screenRoomMsg = { request: "destroy", room: `scr-${conferenceId}` };
        this.janusHandle.send({ message: screenRoomMsg });
    }

    gatewayCallback = () => {

        let me = this;

        // Create session with Gateway callbacks
        let janus = new Janus({
            server: rtcServerUrl,
            success: function () {
                janus.attach(me.getJanusHandle());
            },
            error: function (error) {
                console.log(error);
            },
        });
    }

    getJanusHandle = () => {

        let me = this;
        let opaqueId = this.apiProxy.getUserFuzzyId();

        var attachCallback = {
            plugin: "janus.plugin.videoroom",
            opaqueId: opaqueId,
            success: function (pluginHandle) {
                me.janusHandle = pluginHandle
            },
            error: function (error) {
                Janus.error("  -- Error obtaining Janus Handle...", error);
            },
        }

        return attachCallback;
    }
}