import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { assetHost } from '../stores/APIEndpoints';

import { Typography, Statistic, PageHeader, Button, Tag, Popconfirm, notification, message } from 'antd';
import { MailOutlined, PhoneOutlined, CaretRightOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import SessionStore from '../stores/SessionStore';

import BoardList from "../commons/BoardList";
import SessionLauncher from './SessionLauncher';
import GoldenTemplate from './GoldenTemplate';
import NoteList from '../commons/NoteList';

const { Title, Paragraph } = Typography;

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
        this.store = new SessionStore({ apiProxy: props.appStore.apiProxy });
        this.store.event = this.props.params.event;
    }

    componentDidMount() {
        this.store.loadPeople();
    }


    onFinish = () => {
        console.log("Finished");
    }

    renderTopSegment = (program, session, sessionUser) => {
        return (
            <div key="top_segment">
                <Title style={{ marginTop: 10 }} level={4}>Schedule</Title>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center" }}>
                    {this.renderProgramImage(program)}
                    {this.renderSchedule(session)}
                    <SessionLauncher store={this.store} session={session} sessionUser={sessionUser} />
                </div>
            </div>
        )
    }

    renderProgramImage = (program) => {
        return (
            <div key="programImage" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                    <img style={{ maxHeight: "100%", maxWidth: "100%", minWidth: "100%", verticalAlign: "middle", display: "inline-block" }} src={this.getPosterUrl(program)} />
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
        if (!people.coach) {
            return <></>
        }

        const coach = people.coach;
        const member = people.member;

        return (
            <div key="people">
                <Title style={{ marginTop: 30 }} level={4}>People</Title>
                <div style={{ display: "flex", marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
                    <div key="coachId" style={{ width: "50%" }}>
                        <Statistic title="Coach" value={coach.user.name} valueStyle={{ color: '#3f8600' }} />
                        <Paragraph><MailOutlined /> {coach.user.email}</Paragraph>
                        <Paragraph><PhoneOutlined /> (91)99999 XXXXX</Paragraph>
                    </div>

                    <div key="actorId" style={{ width: "50%", borderLeft: "1px solid lightgray", paddingLeft: 20 }}>
                        <Statistic title="Actor" value={member.user.name} />
                        <Paragraph><MailOutlined /> {member.user.email}</Paragraph>
                        <Paragraph><PhoneOutlined /> (91)99999 xxxx</Paragraph>
                    </div>
                </div>
            </div>
        )
    }

    makeReady = async () => {

        await this.store.alterSessionState("READY");

        if (this.store.isError) {
            failureNotification(this.store.message.help);
        }
        else if (this.store.isDone) {
            message.success('Now, the Session is Ready.');
        }
    }

    cancelEvent = async () => {

        await this.store.alterSessionState("CANCEL");

        if (this.store.isError) {
            failureNotification(store.message.help);
        }
        else if (this.store.isDone) {
            message.success('The session is cancelled.');
        }
    }

    completeEvent = async () => {

        await this.store.alterSessionState("DONE");

        if (this.store.isError) {
            failureNotification(store.message.help);
        }
        else if (this.store.isDone) {
            message.success('The session is marked as completed.');
        }
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


    render() {

        const { program, session, sessionUser } = this.store.event;
        const people = this.store.people;
        const change = this.store.change;

        return (
            <PageHeader key="sessionDetail"
                title={<Title level={3}>{session.name}</Title>}
                subTitle={program.name}
                extra={[
                    this.renderStatus(session),
                    this.makeReadyButton(),
                    this.cancelEventButton(),
                    this.completeEventButton(),
                ]}
            >
                {this.renderTopSegment(program, session, sessionUser)}
                {people.coach && (
                    <div key="assets">
                        <GoldenTemplate key="gt" enrollmentId={session.enrollmentId} memberId={people.member.user.id} apiProxy={this.props.appStore.apiProxy} />
                        <BoardList key="cb" title="Coach Boards" sessionUserId={people.coach.sessionUser.id} />
                        <BoardList key="ab" title="Actor Boards" sessionUserId={people.member.sessionUser.id} />
                        <NoteList key="cn" title="Coach Notes" sessionUserId={people.coach.sessionUser.id} />
                        <NoteList key="an" title="Actor Notes" sessionUserId={people.member.sessionUser.id} />
                    </div>
                )}
                {this.renderPeople(people)}
            </PageHeader>
        )
    }
}

export default SessionDetailUI
