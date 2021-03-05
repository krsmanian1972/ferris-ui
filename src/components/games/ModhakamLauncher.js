import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import ModhakamGameUI from './ModhakamGameUI';
import GamePanel from './GamePanel';

@inject("appStore")
@observer
class ModhakamLauncher extends Component {

    constructor(props) {
        super(props);

        this.state = {
            change: null
        }
    }

    onGameStream = (canvasStream) => {
        if (this.props.screencast) {
            this.props.screencast.startCanvasSharing(canvasStream);
        }
        this.props.callback(this.eventSink);
    }

    /**
     * Will be invoked by the Parent when a roomEvent occurs in the screencast.
     */
    eventSink = () => {
        this.setState({change:new Date()});
    }

    getGameScreens = () => {
        const peerScreens = [];

        if (!this.props.screencast) {
            return peerScreens;
        }

        for (const [key, remoteFeed] of this.props.screencast.remoteFeedMap) {
            if (remoteFeed) {
                const el = <GamePanel key={key} stream={remoteFeed.stream} username={remoteFeed.rfdisplay} height={this.props.height} />
                peerScreens.push(el);
            }
        }

        return peerScreens;
    }

    render() {

        return (
            <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "row", background: "rgb(37,56,74)" }}>
                <div style={{ width: "60%", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
                    <ModhakamGameUI height={this.props.height} screencast={this.props.screencast} username={this.props.username} onGameStream={this.onGameStream} />
                </div>
                <div style={{ width: "40%", display: "flex", flexDirection: "column", overflowY: "auto", alignItems: "center", textAlign: "center", justifyContent: "left" }}>
                    {this.getGameScreens().map(value => value)}
                </div>
            </div>
        )
    }
}

export default ModhakamLauncher;