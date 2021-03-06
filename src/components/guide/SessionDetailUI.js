import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { assetHost } from '../stores/APIEndpoints';

import { Typography, Card, Statistic, PageHeader, Button, Tag, Popconfirm, notification, message } from 'antd';
import { CaretRightOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import EnrollmentListStore from '../stores/EnrollmentListStore';
import SessionStore from '../stores/SessionStore';
import JanusStore from '../conference/JanusStore';

import BoardList from "../commons/BoardList";
import NoteList from '../commons/NoteList';
import SessionLauncher from './SessionLauncher';
import SessionPeers from "./SessionPeers";
import ConferenceMembers from "./ConferenceMembers";
import ClosureDrawer from './ClosureDrawer';

import { cardHeaderStyle, pageHeaderStyle, pageTitle, rustColor } from '../util/Style';

const { Title, Text } = Typography;

const { Countdown } = Statistic;

const failureNotification = (help) => {
    const args = {
        message: 'Unable to Complete your request',
        description: help,
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@inject("appStore")
@observer
class SessionDetailUI extends Component {

    constructor(props) {
        super(props);
        this.enrollmentListStore = new EnrollmentListStore({ apiProxy: props.appStore.apiProxy });
        this.store = new SessionStore({ 
            apiProxy: props.appStore.apiProxy, 
            enrollmentListStore: this.enrollmentListStore,
        });
        this.store.setSelectedEvent(this.props.params.event);

        this.ensureJanusStore();
    }

    /**
     * Create Janus store only if required.
     */
    ensureJanusStore = () => {
        if(this.store.isCoach && this.store.isMulti && !this.store.isClosed) {
            this.janusStore = new JanusStore({ apiProxy: this.props.appStore.apiProxy });
        }
    }

    componentDidMount() {
        this.store.loadPeople();
    }

    componentWillUnmount() {
        if(this.janusStore) {
            this.janusStore.destroy();
        }
    }


    onFinish = () => {
        console.log("Finished");
    }

    renderTopSegment = (program, session, sessionUser, people) => {

        const memberId = people && people.member ? people.member.user.id : "";

        return (

            <Card
                key="top_segment"
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px" }}
                title={<Title level={4}>Schedule</Title>} >

                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center" }}>
                    <p style={{ width: "30%", textAlign: "left" }}>{session.description}</p>
                    {this.renderSchedule(session)}
                    <SessionLauncher store={this.store} session={session} sessionUser={sessionUser} memberId={memberId} />
                </div>
            </Card>

        )
    }

    renderProgramImage = (program) => {
        return (
            <div key="programImage" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                    <img alt={program.name} style={{ maxHeight: "100%", maxWidth: "100%", minWidth: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={this.getPosterUrl(program)} />
                </div>
            </div>
        )
    }

    getPosterUrl = (program) => {
        const url = `${assetHost}/programs/${program.id}/poster/poster.png`;
        return url;
    }

    renderSchedule = (session) => {
        const localeStart = moment(session.scheduleStart * 1000);
        const localeEnd = moment(session.scheduleEnd * 1000);

        return (
            <div key="schedule" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                    <div style={{ maxHeight: "100%", maxWidth: "100%", minWidth: "100%", verticalAlign: "middle", display: "inline-block" }}>
                        <Countdown value={localeStart} onFinish={this.onFinish} />
                        <p><Moment format="llll" style={{ fontWeight: "bold" }}>{localeStart}</Moment></p>
                        <p style={{ marginTop: "-15px", marginBottom: "0px" }}>to</p>
                        <p><Moment format="llll" style={{ fontWeight: "bold" }}>{localeEnd}</Moment></p>
                    </div>
                </div>
            </div>
        )
    }

    renderPeople = (people) => {

        if (people.coach && this.store.isMono) {
            return (
                <SessionPeers people={people}/>
            )
        }

        if (people.coach && this.store.isMulti){
            return (
                <ConferenceMembers sessionStore = {this.store} />
            )
        }
    }

    makeReady = async () => {
        const { session } = this.store.event;

        if (this.store.isMulti) {
            this.janusStore.provisionRooms(session.conferenceId);
        }

        await this.store.alterSessionState("READY");

        if (this.store.isError) {
            failureNotification(this.store.message.help);
        }
        else if (this.store.isDone) {
            message.success('Now, the Session is Ready.');
        }
    }

    cancelEvent = () => {
        const { session } = this.store.event;
        if (this.store.isMulti) {
            this.janusStore.removeRooms(session.conferenceId);
        }
        
        this.store.targetState = "CANCEL";
        this.store.showClosureDrawer = true;
    }

    completeEvent = () => {
        const { session } = this.store.event;
        if (this.store.isMulti) {
            this.janusStore.removeRooms(session.conferenceId);
        }
        
        this.store.targetState = "DONE";
        this.store.showClosureDrawer = true;
    }

    renderStatus = (session) => {
        return <Tag key="status" color="#108ee9">{session.status}</Tag>
    }

    makeReadyButton = () => {
        if (this.store.canMakeReady) {
            return (
                <Popconfirm key="ready_pop" placement="left" title="Activate this session as Ready?" okText="Yes" cancelText="No"
                    onConfirm={() => this.makeReady()}
                >
                    <Button key="ready" style={{ border: "1px solid green", color: "green" }} icon={<CaretRightOutlined />} shape="circle"></Button>
                </Popconfirm>
            )
        }
    }

    cancelEventButton = () => {
        if (this.store.canCancelEvent) {
            return (
                <Popconfirm key="cancel_pop" placement="left" title="Mark this session as Cancelled?" okText="Yes" cancelText="No"
                    onConfirm={() => this.cancelEvent()}
                >
                    <Button key="cancel" danger icon={<CloseOutlined />} shape="circle"></Button>
                </Popconfirm>
            )
        }
    }

    completeEventButton = () => {
        if (this.store.canCompleteEvent) {
            return (
                <Popconfirm key="complete_pop" placement="left" title="Mark this session as Completed?" okText="Yes" cancelText="No"
                    onConfirm={() => this.completeEvent()}
                >
                    <Button key="complete" style={{ border: "1px solid green", color: "green" }} icon={<CheckOutlined />} shape="circle"></Button>
                </Popconfirm>
            )
        }
    }

    renderArtifacts = (people, session) => {
        if (this.store.isMono && people.coach) {
            return (
                <div key="assets" style={{ marginTop: 10 }}>
                    <BoardList key="cb" title="Session Boards" sessionId={session.id} />
       
                    <NoteList key="cn" title="Coach Notes" sessionUserId={people.coach.sessionUser.id} closingNotes={session.closingNotes} />
                    <NoteList key="an" title="Actor Notes" sessionUserId={people.member.sessionUser.id} />
                </div>
            )
        }
    }

    render() {

        const { program, session, sessionUser } = this.store.event;
        const people = this.store.people;

        // eslint-disable-next-line
        const change = this.store.change;


        return (
            <>
                <PageHeader key="sessionDetail"
                    style={pageHeaderStyle}
                    title={pageTitle(session.name)}
                    subTitle={<Text style={rustColor}>{program.name}</Text>}
                    extra={[
                        this.renderStatus(session),
                        this.makeReadyButton(),
                        this.cancelEventButton(),
                        this.completeEventButton(),
                    ]}
                >
                    {this.renderTopSegment(program, session, sessionUser, people)}
                    {this.renderArtifacts(people, session)}
                    {this.renderPeople(people)}
                </PageHeader>

                <ClosureDrawer store={this.store} />
            </>
        )
    }
}

export default SessionDetailUI
