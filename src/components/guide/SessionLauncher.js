import React, { Component } from 'react';
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
            portalSize:{height:screen.height*0.75,width:screen.width*0.75}
        };

        this.toggleWindowPortal = this.toggleWindowPortal.bind(this);
        this.closeWindowPortal = this.closeWindowPortal.bind(this);
        this.portalResized = this.portalResized.bind(this);
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

    portalResized(size) {
        this.setState({portalSize:size});
    }

    openWindow(featureKey) {
        const h = screen.height*0.75;
        const w = screen.width*0.75;

        const url = `${baseUrl}?featureKey=${featureKey}&token=${123}`;

        // STEP 3: open a new browser window and store a reference to it
        this.externalWindow = window.open(url, 'Current Session - Traits In Rust', 'toolbar=yes ,location=0, status=no,titlebar=no,menubar=yes,width='+w +',height=' +h);

    }

    render() {
        return (
            <Card style={{ height: 135 }}>
                <Meta description="Launch" style={{ marginBottom: 10 }} />

                <Button type="primary" onClick={this.toggleWindowPortal}>
                    {this.state.showWindowPortal ? 'End the' : 'Start the'} Session
                </Button>

                {this.state.showWindowPortal && (
                    this.openWindow("broadcast")
                )}
            </Card>
        )
    }
}

export default SessionLauncher