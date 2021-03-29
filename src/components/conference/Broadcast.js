import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import BroadcastWorkbench from './BroadcastWorkbench';
import VideoContainer from './VideoContainer';
import VideoControl from './VideoControl';

@inject("appStore")
@observer
class Broadcast extends Component {

    constructor(props) {
        super(props);

        this.state = {
            portalSize: { height: window.innerHeight, width: window.innerWidth },
        }
    }

    componentDidMount() {

        window.addEventListener("resize", () => {
            const portalSize = { height: window.innerHeight, width: window.innerWidth };
            this.setState({ portalSize: portalSize });
        });

        this.auditUser();
    }

    /**
     * Today we are not auditing the user. 
     */
    auditUser = () => {
        this.videoContainer = new VideoContainer(this.props, this.videoHolder);
    }

    videoCallback = (device,intent) => {

        if(!this.videoContainer) {
            return;
        }

        if(device === "video") {
            if(intent === "on") {
                this.videoContainer.videoRoom.unmuteVideo();
            }
            else {
                this.videoContainer.videoRoom.muteVideo();
            }
        }
        else {
            if(intent === "on") {
                this.videoContainer.videoRoom.unmuteAudio();
            }
            else {
                this.videoContainer.videoRoom.muteAudio();
            }
        }
    }

    render() {

        const { portalSize } = this.state;
        const viewHeight = portalSize.height * 0.99;

        return (
            <div className="broadcast" style={{ height: viewHeight }}>
                <div className="broadcast-west">
                    <div className="broadcast-workbench">
                        <div className="broadcast-top" key="videoHolder" id="videoHolder" ref={ref => (this.videoHolder = ref)} />
                        <div className="broadcast-south">
                            <VideoControl callback={this.videoCallback}/>
                        </div>
                    </div>    
                </div>
                <div className="broadcast-center" >
                    <BroadcastWorkbench params={this.props.params}/>
                </div>
            </div>
        )
    }
}

export default Broadcast;


