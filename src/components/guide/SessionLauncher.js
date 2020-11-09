import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import { baseUrl } from '../stores/APIEndpoints';

const FEATURE_KEY = "broadcast";

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


    openWindow() {

        const title = this.props.session.name;
        const sessionId = this.props.session.id;
        const sessionUserId = this.props.sessionUser.id;
        const sessionUserType = this.props.sessionUser.userType;
        const enrollmentId = this.props.session.enrollmentId;
        const memberId = this.props.memberId;

        const h = screen.height * 0.75;
        const w = screen.width * 0.75;
        const l = (screen.width - w) / 2;
        const t = (screen.height - h) / 2;

        const url = `${baseUrl}?featureKey=${FEATURE_KEY}&sessionId=${sessionId}&sessionUserId=${sessionUserId}&sessionUserType=${sessionUserType}&enrollmentId=${enrollmentId}&memberId=${memberId}`;
        const specs = `toolbar=0 ,location=0, status=no,titlebar=1,menubar=0,width=${w},height=${h},left=${l},top=${t}`;

        this.externalWindow = window.open(url, title, specs);
    }

    getButtonLabel = () => {
   
        if (this.state.showWindowPortal) {
            return "Intermission";
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