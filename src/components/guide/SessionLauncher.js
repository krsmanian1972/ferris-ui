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
        };
        this.toggleWindowPortal = this.toggleWindowPortal.bind(this);
        this.closeWindowPortal = this.closeWindowPortal.bind(this);
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

    render() {
        return (
            <Card>
                <Meta description="Launch" style={{ marginBottom: 5 }} />
                <Button type="primary" onClick={this.toggleWindowPortal}>
                    {this.state.showWindowPortal ? 'End the' : 'Start the'} Session
                </Button>

                {this.state.showWindowPortal && (
                    <XPortal name="Session - Traits in Rust" closeWindowPortal={this.closeWindowPortal}>
                        <Broadcast />
                    </XPortal>
                )}
            </Card>
        )
    }
}

export default SessionLauncher