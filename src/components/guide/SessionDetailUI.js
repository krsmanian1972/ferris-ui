import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { assetHost } from '../stores/APIEndpoints';

import { Card, Typography, Statistic, PageHeader } from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import SessionStore from '../stores/SessionStore';

import Editor from "../commons/Editor";
import SessionLauncher from './SessionLauncher';
import MiniBoard from './MiniBoard';


const { Meta } = Card;
const { Title, Text, Paragraph } = Typography;

const { Countdown } = Statistic;


const SESSION_USER_FUZZY_ID = 'd91e5527-9cc3-4d56-9c69-d386c9cba535';

@inject("appStore")
@observer
class SessionDetailUI extends Component {
    constructor(props) {
        super(props);
        this.store = new SessionStore({ apiProxy: props.appStore.apiProxy })
    }

    componentDidMount() {
        const { session } = this.props.params.event;
        this.store.loadPeople(session.fuzzyId);
    }


    onFinish = () => {
        console.log("Finished");
    }

    getPosterUrl = (program) => {
        const url = `${assetHost}/programs/${program.fuzzyId}/poster/poster.png`;
        return url;
    }

    renderTopSegment = (program, session, sessionUser) => {
        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center" }}>
                {this.renderProgramImage(program)}
                {this.renderSchedule(session)}
                <SessionLauncher session={session} sessionUser={sessionUser} />
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
            <>
                <Card>
                    <Statistic title="Coach" value={coach.name} valueStyle={{ color: '#3f8600' }} />
                    <Paragraph><MailOutlined /> {coach.email}</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 XXXXX</Paragraph>
                </Card>

                <Card>
                    <Statistic title="Actor" value={member.name} />
                    <Paragraph><MailOutlined /> {member.email}</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 xxxx</Paragraph>
                </Card>
            </>
        )
    }


    render() {

        const { program, session, sessionUser } = this.props.params.event;
        const people = this.store.people;

        return (
            <>
                <PageHeader title={<Title level={4}>{session.name}</Title>} subTitle={program.name}>
                    {this.renderTopSegment(program, session, sessionUser)}
                    <Editor value={session.description} readOnly={true} />
                </PageHeader>

                {this.renderPeople(people)}
            </>
        )
    }
}

export default SessionDetailUI
