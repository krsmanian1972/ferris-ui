import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'antd';
import { baseUrl } from '../stores/APIEndpoints';

const FEATURE_KEY ="broadcast";

@inject("appStore")
@observer
class SessionLauncher extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showWindowPortal: false,
        };

        this.closeWindowPortal = this.closeWindowPortal.bind(this);
        this.openWindow = this.openWindow.bind(this);
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.closeWindowPortal);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.closeWindowPortal);
    }

    toggleWindowPortal = () => {
        this.setState({ showWindowPortal: !this.state.showWindowPortal });
    }

    closeWindowPortal = () => {
        this.setState({ showWindowPortal: false })
    }


    openWindow() {
        
        const title = this.props.session.name;
        const sessionFuzzyId = this.props.session.fuzzyId;
        const sessionUserFuzzyId = this.props.sessionUser.fuzzyId;
        const sessionUserType = this.props.sessionUser.userType;

        const h = screen.height * 0.75;
        const w = screen.width * 0.75;
        const l = (screen.width - w) / 2;
        const t = (screen.height - h) / 2;

        const url = `${baseUrl}?featureKey=${FEATURE_KEY}&sessionFuzzyId=${sessionFuzzyId}&sessionUserFuzzyId=${sessionUserFuzzyId}&sessionUserType=${sessionUserType}`;
        const specs = `'toolbar=yes ,location=0, status=no,titlebar=no,menubar=yes,width=${w},height=${h},left=${l},top=${t}`;
        
        this.externalWindow = window.open(url, title, specs);
    }

    getButtonLabel = () => {
        const role = this.props.sessionUser.userType;

        if (role === 'coach') {
            if (!this.state.showWindowPortal) {
                return "Start Session";
            }
            return "End Session";
        }

        if (!this.state.showWindowPortal) {
            return "Join Session";
        }
        return "Exit Session";
    }

    render() {
        return (
            <div style={{ paddingTop: 10 }}>
                <Button type="primary" onClick={this.toggleWindowPortal}>
                    {this.getButtonLabel()}
                </Button>

                {this.state.showWindowPortal && (
                    this.openWindow()
                )}
            </div>
        )
    }
}


export default SessionLauncher