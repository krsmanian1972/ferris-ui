import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import { baseUrl } from '../stores/APIEndpoints';

import {BROADCAST_FEATURE_KEY, PEERCAST_FEATURE_KEY} from '../util/Features';

@observer
class SessionLauncher extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showWindowPortal: false,
        };

        this.closeWindowPortal = this.closeWindowPortal.bind(this);
        this.openWindow = this.openWindow.bind(this);
        
        props.store.startPolling();
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.closeWindowPortal);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.closeWindowPortal);
    }

    toggleWindowPortal = async() => {
        const store = this.props.store
        await store.updateSessionProgress();
        this.setState({ showWindowPortal: !this.state.showWindowPortal });
    }

    closeWindowPortal = () => {
        this.setState({ showWindowPortal: false })
    }

    getFeatureKey = () => {
        if (!this.props.session.sessionType) {
            return PEERCAST_FEATURE_KEY;
        }
        if(this.props.session.sessionType === "multi") {
            return BROADCAST_FEATURE_KEY;
        }
        return PEERCAST_FEATURE_KEY;
    }

    openWindow() {

        const title = this.props.session.name;
        const sessionId = this.props.session.id;
        const sessionUserId = this.props.sessionUser.id;
        const sessionUserType = this.props.sessionUser.userType;
        const enrollmentId = this.props.session.enrollmentId;
        const memberId = this.props.memberId;
        const featureKey = this.getFeatureKey();

        const h = screen.height * 0.75;
        const w = screen.width * 0.75;
        const l = (screen.width - w) / 2;
        const t = (screen.height - h) / 2;

        const url = `${baseUrl}?featureKey=${featureKey}&sessionId=${sessionId}&sessionUserId=${sessionUserId}&sessionUserType=${sessionUserType}&enrollmentId=${enrollmentId}&memberId=${memberId}`;
        const specs = `toolbar=0 ,location=0, status=no,titlebar=1,menubar=0,width=${w},height=${h},left=${l},top=${t}`;

        this.externalWindow = window.open(url, "_blank");
    }

    getButtonLabel = () => {
   
        if (this.state.showWindowPortal) {
            return "Live";
        }

        const store = this.props.store
        if (store.isCoach && store.event.session.status === "READY") {
            return "Launch Session";
        }

        return "Join Session";
    }

    renderButton = (status) => {
        const store = this.props.store;

        if (store.canBroadcast) {
            return (
                <Button disabled={store.isLoading} type="primary" onClick={this.toggleWindowPortal}>
                    {this.getButtonLabel()}
                </Button>
            )
        }
        else {
            return (
                <p>{store.broadcastHelp}</p>
            )
        }
    }

    render() {
        
        const pollStatus = this.props.store.pollStatus;

        return (
            <div style={{wordWrap:"break-word",width:"20%"}}>
                {this.renderButton(pollStatus)}
                {this.state.showWindowPortal && (
                    this.openWindow()
                )}
            </div>
        )
    }
}


export default SessionLauncher