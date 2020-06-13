import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Button, Row } from 'antd';

import Broadcast from './Broadcast';
import XPortal from './XPortal';

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


    render() {
        return (
            <Card style={{ height: 135 }}>
                <Meta description="Launch" style={{ marginBottom: 10 }} />

                <Button type="primary" onClick={this.toggleWindowPortal}>
                    {this.state.showWindowPortal ? 'End the' : 'Start the'} Session
                </Button>

                {this.state.showWindowPortal && (
                    <XPortal name="Current Session - Traits in Rust" closeWindowPortal={this.closeWindowPortal} portalResized={this.portalResized}>
                        <Broadcast portalSize = {this.state.portalSize}/>
                    </XPortal>
                )}
            </Card>
        )
    }
}

export default SessionLauncher