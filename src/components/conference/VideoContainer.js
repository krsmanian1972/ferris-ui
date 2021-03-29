import VideoRoom from './VideoRoom';

const height = window.innerHeight * 18 / 100;
const thumbnail = `max-height: ${height}px`;
const hide = 'display:none';
const show = 'display:block';

const MAX_CAPACITY = 10;

class VideoContainer {

    // Mapping the RFID to the index of the Video Panel
    panelIds = [];

    constructor(props, parentPanel) {
        this.props = props;
        this.parentPanel = parentPanel;

        this.renderVideoHolders();

        this.videoRoom = new VideoRoom(props, this.roomListener);
        this.videoRoom.startRoom();
    }

    roomListener = (roomEvent) => {

        if(!roomEvent) {
            return;
        }

        if (roomEvent.type && roomEvent.type === "local") {
            this.setLocalVideo(roomEvent);
        }
        else {
            this.handleRoomEvent(roomEvent);
        }
    }

    handleRoomEvent = (event) => {
        if (!event.rfid) {
            return;
        }

        const rfid = event.rfid;
        const index = this.getPanelIndex(rfid);

        if (index === -1) {
            return;
        }

        const remoteFeed = this.videoRoom.remoteFeedMap.get(rfid);
        const status = event.status;

        if (status === "attached") {
            this.prepareVideo(index, remoteFeed.rfdisplay, rfid);
        }
        if (status === "remoteStream") {
            this.showVideo(index, remoteFeed.stream)
        }
        if (status === "detached") {
            this.hideVideo(index);
        }
    }

    getPanelIndex = (rfid) => {
        if (!rfid) {
            return - 1;
        }

        for (let index = 1; index < this.panelIds.length; index++) {
            if (this.panelIds[index] === rfid) {
                return index;
            }
        }

        for (let index = 1; index < this.panelIds.length; index++) {
            if (!this.panelIds[index]) {
                this.panelIds[index] = rfid;
                return index;
            }
        }

        return -1;
    }

    prepareVideo = (index, username, rfid) => {
        this.panelIds[index] = rfid;

        const key = `vp_${index.toString()}`;
        const vp = document.getElementById(key);
        const userNameText = vp.querySelector("p");
        userNameText.innerHTML = username;

        vp.setAttribute('style',show);
    }

    showVideo = (index, stream) => {
        const key = `vp_${index.toString()}`;
        const vp = document.getElementById(key);
        if (vp && stream) {
            const videoEl = vp.querySelector("video");
            videoEl.srcObject = stream;
        }
    }

    hideVideo = (index) => {
        this.panelIds[index] = undefined;

        const key = `vp_${index.toString()}`;
        const vp = document.getElementById(key);

        const userNameText = vp.querySelector("p");
        userNameText.innerHTML = '&nbsp;';

        const videoEl = vp.querySelector("video");
        videoEl.srcObject = undefined;

        vp.setAttribute('style',hide);
    }

    setLocalVideo = (event) => {
        this.panelIds[0] = "self";
        const index = 0;
        const key = `vp_${index.toString()}`;
        const vp = document.getElementById(key);
        if (vp && event.myVideoStream) {

            vp.setAttribute('style',show);

            const userNameText = vp.querySelector("p");
            userNameText.innerHTML = this.props.appStore.credentials.username;

            const videoEl = vp.querySelector("video");
            videoEl.srcObject = event.myVideoStream;
            videoEl.muted = "muted";
        }
    }

    /**
     * To be called only once. Ensure not to maintain any state
     * @returns 
     */
    renderVideoHolders = () => {
        this.panelIds.length = 0;
        for (let index = 0; index < MAX_CAPACITY; index++) {
            const placeHolder = this.buildVideoPlaceHolder(index);
            this.parentPanel.appendChild(placeHolder);
            this.panelIds.push(undefined);
        }
    }

    
    buildVideoPlaceHolder = (index) => {
        const key = `vp_${index.toString()}`;

        const videoPanel = document.createElement('div');
        videoPanel.setAttribute("id", key);
        videoPanel.setAttribute("class", "video_panel");
        videoPanel.setAttribute("style", hide);

        const userNameText = document.createElement("p");
        userNameText.setAttribute("id", "userName");
        userNameText.innerHTML = '&nbsp;';
        userNameText.setAttribute("class", index === 0 ? "video_local_name" : "video_remote_name");

        const videoTag = document.createElement("video");
        videoTag.setAttribute("id", "video");
        videoTag.setAttribute("style", thumbnail);
        videoTag.setAttribute("poster", index === 0 ? "videoSelf.png" : "videoPeer.png");
        videoTag.setAttribute("autoplay", true)

        videoPanel.appendChild(userNameText);
        videoPanel.appendChild(videoTag);

        return videoPanel;
    }
}

export default VideoContainer;