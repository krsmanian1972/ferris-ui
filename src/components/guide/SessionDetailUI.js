import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { assetHost } from '../stores/APIEndpoints';

import { Card, Typography, Statistic, PageHeader, Button, Tag,Popconfirm,notification,message } from 'antd';
import { MailOutlined, PhoneOutlined, CaretRightOutlined, CloseOutlined } from '@ant-design/icons';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import SessionStore from '../stores/SessionStore';

import Editor from "../commons/Editor";
import SessionLauncher from './SessionLauncher';
import MiniBoard from './MiniBoard';

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
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center" }}>
                {this.renderProgramImage(program)}
                {this.renderSchedule(session)}
                <SessionLauncher store={this.store} session={session} sessionUser={sessionUser} />
            </div>
        )
    }

    renderProgramImage = (program) => {
        return (
            <div key={program.fuzzyId} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                    <img style={{ maxHeight: "100%", maxWidth: "100%", minWidth: "100%", verticalAlign: "middle", display: "inline-block" }} src={this.getPosterUrl(program)} />
                </div>
            </div>
        )
    }

    getPosterUrl = (program) => {
        const url = `${assetHost}/programs/${program.fuzzyId}/poster/poster.png`;
        return url;
    }

    renderSchedule = (session) => {
        const localeStart = moment(session.scheduleStart * 1000);
        const localeEnd = moment(session.scheduleEnd * 1000);

        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
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
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Card style={{width:"50%"}}>
                    <Statistic title="Coach" value={coach.name} valueStyle={{ color: '#3f8600' }} />
                    <Paragraph><MailOutlined /> {coach.email}</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 XXXXX</Paragraph>
                </Card>

                <Card style={{width:"50%"}}>
                    <Statistic title="Actor" value={member.name} />
                    <Paragraph><MailOutlined /> {member.email}</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 xxxx</Paragraph>
                </Card>
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

    renderStatus = (session) => {
        return <Tag key="status" color="#108ee9">{session.status}</Tag>
    }

    makeReadyButton = () => {
        if (!this.store.canMakeReady) {
            return <></>
        }
    
        return (
            <Popconfirm placement="left" title="Mark this session as Ready?" okText="Yes" cancelText="No"
                onConfirm={() => this.makeReady()}
            >
                <Button key="ready" style={{ border: "1px solid green", color: "green" }} icon={<CaretRightOutlined />} shape="circle"></Button>
            </Popconfirm>
        )
        
    }

    cancelEventButton = () => {
        if(!this.store.canCancelEvent) {
            return <></>
        }

        return (
            <Popconfirm placement="left" title="Mark this session as Cancelled?" okText="Yes" cancelText="No"
                onConfirm={() => this.cancelEvent()}
            >
                <Button key="cancel" danger icon={<CloseOutlined />} shape="circle"></Button>
            </Popconfirm>
        )
    }

  

    render() {

        const { program, session, sessionUser } = this.store.event;
        const people = this.store.people;
        const change = this.store.change;

        return (
            <>
                <PageHeader
                    title={<Title level={4}>{session.name}</Title>}
                    subTitle={program.name}
                    extra={[
                        this.renderStatus(session),
                        this.makeReadyButton(),
                        this.cancelEventButton(),
                    ]}
                >
                    {this.renderTopSegment(program, session, sessionUser)}
                    <Editor value={session.description} readOnly={true} />
                </PageHeader>

                {this.renderPeople(people)}
            </>
        )
    }
}

export default SessionDetailUI
