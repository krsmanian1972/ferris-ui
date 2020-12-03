/**
 * When a program has more than one coach for a member to select, we call
 * the situation as selective enrollment. 
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Typography, Card,Tooltip,Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import CoachAssociationDrawer from '../guide/CoachAssociationDrawer';

import { cardHeaderStyle } from '../util/Style';
import AboutCoach from './AboutCoach';


const { Title } = Typography;

@observer
export default class CoachProvider extends Component {
    constructor(props) {
        super(props);
    }

    getAssociateCoachButton = () => {
        return (
            <Tooltip key="new_coach_tip" title="To associate a new coach into this program.">
                <Button key="associateCoach" onClick={this.onAssociateCoach} type="primary" icon={<PlusOutlined />}>New Coach</Button>
            </Tooltip>
        );
    }

    onAssociateCoach = () => {
        this.props.programStore.showCoachAssociationDrawer = true;
    }

    renderCoaches = () => {
        const store = this.props.programStore;

        if (store.canEnroll) {
            return this.renderEnrollableCoaches();
        }

        if (store.isPeerCoach) {
            return this.renderPeerCoaches();
        }

        return this.renderProgramCoach();
    }

    renderProgramCoach = () => {

        const programModel = this.props.programStore.programModel
        const { program, coach } = programModel;

        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px", marginTop: "10px" }}
                title={<Title level={4}>Your Coach</Title>}>
                <AboutCoach coach={coach} program={program} canEnroll={false} />
            </Card>

        )
    }

    /**
     * When the user is just a member and NOT one among the peer coach.
     */
    renderEnrollableCoaches = () => {
        const store = this.props.programStore;
        const peerCoaches = store.peerCoaches;
        const abouts = [];
        if (peerCoaches) {
            for (var index = 0; index < peerCoaches.length; index++) {
                const { coach, program } = peerCoaches[index];
                abouts.push(<AboutCoach key={index} coach={coach} program={program} canEnroll={true} onEnroll={this.props.onEnroll} />);
            }
        }

        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px", marginTop: "10px" }}
                title={<Title level={4}>Coaches</Title>}>
                {abouts}
            </Card>
        )
    }

    /**
     * When the user is just a member and NOT one among the peer coach.
     */
    renderPeerCoaches = () => {
        const store = this.props.programStore;
        const peerCoaches = store.peerCoaches;
        const userId = store.apiProxy.getUserFuzzyId();

        const abouts = [];
        if (peerCoaches) {
            for (var index = 0; index < peerCoaches.length; index++) {
                const { coach, program } = peerCoaches[index];
                const isYou = coach.id === userId;
                abouts.push(<AboutCoach key={index} coach={coach} program={program} canEnroll={false} isYou={isYou} />);
            }
        }

        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px", marginTop: "10px" }}
                extra={this.getAssociateCoachButton()}
                title={<Title level={4}>Peer Coaches</Title>}>

                {abouts}

                <CoachAssociationDrawer programStore={this.props.programStore}/>
            </Card>
        )
    }

    render() {
        const store = this.props.programStore;

        if (store.isLoading) {
            return (
                <div className="loading-container"><Spin /></div>
            )
        }

        if (store.isError) {
            return (
                <Result status="warning" title={store.message.help} />
            )
        }

        return (this.renderCoaches());
    }
}
