import Janus from './Janus.js';
import { rtcServerUrl } from '../stores/APIEndpoints';

export default class JanusStore {

    constructor(props) {
        this.apiProxy = props.apiProxy;
        Janus.init({ debug: "all", callback: this.gatewayCallback });
    }

    provisionVideoRoom = (conferenceId) => {
        var message = {
            request: "create",
            room: conferenceId,
        };

        this.janusHandle.send({ message: message });
    }

    removeVideoRoom = (conferenceId) => {

        var message = {
            request: "destroy",
            room: conferenceId,
        };

        this.janusHandle.send({ message: message });
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