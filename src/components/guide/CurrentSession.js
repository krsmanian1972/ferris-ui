import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { assetHost } from '../stores/APIEndpoints';

import { Card, Typography, Statistic } from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import Editor from "../commons/Editor";
import SessionLauncher from './SessionLauncher';
import PeerStatus from './PeerStatus';

const { Text,Paragraph } = Typography;

const { Countdown } = Statistic;

const deadline = moment().add(5, 'minute');

const SESSION_USER_FUZZY_ID = 'd91e5527-9cc3-4d56-9c69-d386c9cba535';

@inject("appStore")
@observer
class CurrentSession extends Component {
    constructor(props) {
        super(props);
    }

    onFinish = () => {
        console.log("Finished");
    }

    getPosterUrl = (program) => {
        const url = `${assetHost}/programs/${program.fuzzyId}/poster/poster.png`;
        return url;
    }

    getName = (name) => {
        return <Text style={{ textAlign: "center" }}>{name}</Text>
    }

    renderTopSegment = (program, session) => {
        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center" }}>
                {this.render_program_image(program)}
                {this.render_schedule(session)}
            </div>
        )
    }

    render_program_image = (program) => {
        return (
            <div key={program.fuzzyId} style={{ display: "flex", flexDirection: "column" }}>
                {this.getName(program.name)}
                <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                    <img style={{ maxHeight: "100%", maxWidth: "100%", minWidth: "100%", verticalAlign: "middle", display: "inline-block" }} src={this.getPosterUrl(program)} />
                </div>
            </div>
        )
    }

    render_schedule = (session) => {
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                    <div style={{ maxHeight: "100%", maxWidth: "100%", minWidth: "100%", verticalAlign: "middle", display: "inline-block" }}>
                        <Countdown value={deadline} onFinish={this.onFinish} />
                        <Moment format="llll" style={{ fontWeight: "bold" }}>{deadline}</Moment>
                        <SessionLauncher title="Traits in Rust" sessionId="24" />
                    </div>
                </div>
            </div>
        )
    }

    render_people = () => {
        return (
            <>
                <Card>
                    <Statistic title="Coach" value="Gopal Sankaran" valueStyle={{ color: '#3f8600' }} />
                    <Paragraph><MailOutlined /> gopals@pmpowerxx.com</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 99999</Paragraph>
                </Card>

                <Card>
                    <Statistic title="Actor" value="Raja Subramanian K" />
                    <p><Text><MailOutlined /> raja@pmpowerxx.com</Text></p>
                    <p><Text><PhoneOutlined /> (91)99999 xxxx9</Text></p>
                </Card>
            </>
        )
    }
    render() {
        const program = { name: "Antibiotics", fuzzyId: "69564961-bd0a-491f-9783-743634b9adfd" }
        const session = { fuzzyId: "",name:"1st session on", description:"ajfdkajfkjf"}
        return (
            <>
                {this.renderTopSegment(program, session)}
                <Card>
                    {this.getName(session.name)}
                    <Editor value={session.description} readOnly={true} />
                </Card>    
                {this.render_people()}
            </>
        )
    }
}

export default CurrentSession
