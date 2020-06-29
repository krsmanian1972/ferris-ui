import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { inject, observer } from 'mobx-react';

import { Card, Button } from 'antd';

import {baseUrl} from '../stores/APIEndpoints'; 


const { Meta } = Card;


@inject("appStore")
@observer
class SessionLauncher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWindowPortal: false,
        };

        this.toggleWindowPortal = this.toggleWindowPortal.bind(this);
        this.closeWindowPortal = this.closeWindowPortal.bind(this);
        this.openWindow = this.openWindow.bind(this);
    }

    componentDidMount() {
        window.addEventListener('beforeunload', () => {
            this.closeWindowPortal();
        });
    }

    toggleWindowPortal() {
        this.setState(state => ({
            ...state,
            showWindowPortal: !state.showWindowPortal,
        }));
    }

    closeWindowPortal() {
        this.setState({ showWindowPortal: false })
    }


    openWindow(featureKey) {
        const h = screen.height*0.75;
        const w = screen.width*0.75;
        const l = (screen.width-w)/2;
        const t = (screen.height-h)/2;
      
        const url = `${baseUrl}?featureKey=${featureKey}&sessionId=${this.props.sessionId}`;
        const specs = `'toolbar=yes ,location=0, status=no,titlebar=no,menubar=yes,width=${w},height=${h},left=${l},top=${t}`;
        this.externalWindow = window.open(url, this.props.title, specs);
          
    }

    getButtonLabel = () =>{
        const role = this.props.appStore.credentials.role;

        if( role === 'guide') {
            if(!this.state.showWindowPortal) {
                return "Start Session";
            }
            return "End Session";
        }

        if(!this.state.showWindowPortal) {
            return "Join Session";
        }
        return "Exit Session";
    }

    render() {
        return (
            <Card style={{ height: 135 }}>
                <Meta description="Launch" style={{ marginBottom: 10 }} />

                <Button type="primary" onClick={this.toggleWindowPortal}>
                    {this.getButtonLabel()}
                </Button>

                {this.state.showWindowPortal && (
                    this.openWindow("broadcast")
                )}
            </Card>
        )
    }
}

SessionLauncher.propTypes = {
    title: PropTypes.string.isRequired,
    sessionId: PropTypes.string.isRequired,
};

export default SessionLauncher