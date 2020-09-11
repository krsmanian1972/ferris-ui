import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button, Statistic } from 'antd';
import { PlusCircleOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import ReactPlayer from 'react-player';

import { assetHost } from '../stores/APIEndpoints';
import ProgramStore from '../stores/ProgramStore';
import EnrollmentStore from '../stores/EnrollmentStore';

import ProgramDescription from './ProgramDescription';
import EnrollmentModal from './EnrollmentModal';

import Milestones from '../guide/Milestones';
import GoldenTemplate from '../guide/GoldenTemplate';
import ProgramSessions from './ProgramSessions';

const { Title, Paragraph } = Typography;

@inject("appStore")
@observer
class ProgramDetailUI extends Component {

    constructor(props) {
        super(props);
        this.store = new ProgramStore({ apiProxy: props.appStore.apiProxy })
        this.enrollmentStore = new EnrollmentStore({ apiProxy: props.appStore.apiProxy });
    }

    componentDidMount() {
        this.load(this.props.params.programId);
    }

    load = async (programId) => {
        await this.store.load(programId);
    }

    getPosterUrl = (programId) => {
        return `${assetHost}/programs/${programId}/poster/poster.png`;
    }

    getEnrollmentButton = () => {
        if (!this.store.canEnroll) {
            return;
        }
        return (
            <Tooltip key="new_program_tip" title="Enroll into this program">
                <Button key="add" onClick={this.onEnroll} type="primary" icon={<PlusCircleOutlined />}>Enroll</Button>
            </Tooltip>
        );
    }

    onEnroll = () => {
        this.enrollmentStore.showEnrollmentModal = true;
    }

    showSessionDetail = (event) => {
        const params = { event: event, parentKey: "programDetailUI" };
        this.props.appStore.currentComponent = { label: "Session Detail", key: "sessionDetail", params: params };
    }

    render() {

        if (this.store.isLoading || this.store.state === "init") {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.store.isError) {
            return <Result status="warning" title={this.store.message.help} />
        }

        return this.renderProgramModel();
    }

    getTrailer = (program, change) => {
        const url = `${assetHost}/programs/${program.id}/trailer/trailer.mp4`;
        return (
            <Card style={{ borderRadius: "12px", marginTop: "10px" }} title={<Title level={4}>Trailer</Title>}>
                <div className='trailer-wrapper'>
                    <ReactPlayer width='100%' height='100%' controls className='trailer' url={url} />
                </div>
            </Card>
        )
    }

    getProgramPoster = (program, change) => {
        const url = `${assetHost}/programs/${program.id}/poster/poster.png`;
        return (
            <div style={{ textAlign: "center", height: 350 }}>
                <div style={{ display: "inline-block", verticalAlign: "middle", height: 350 }}></div>
                <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={url} />
            </div>
        )
    }

    /**
     * Let us show the coaching plan to the actor, if enrolled.
     */
    renderActorCoachingPlan = () => {
        if (this.store.isOwner) {
            return;
        }

        if (!this.store.isEnrolled) {
            return;
        }

        const { enrollmentId } = this.store.programModel;
        const memberId = this.props.appStore.apiProxy.getUserFuzzyId();

        return (
            <GoldenTemplate key="gt" enrollmentId={enrollmentId} memberId={memberId} apiProxy={this.props.appStore.apiProxy} />
        )
    }

    renderProgramModel = () => {

        const { program, coach } = this.store.programModel;
        const change = this.store.change;

        return (
            <>
                <PageHeader title={<Title level={3}>{program.name}</Title>}
                    extra={[
                        this.getEnrollmentButton(),
                    ]}>
                </PageHeader>
                
                <div style={{ paddingLeft: 5, paddingRight: 5 }}>
                    {this.getProgramPoster(program, change)}

                    {this.getTrailer(program, change)}

                    <Card style={{ borderRadius: "12px", marginTop: "10px", background: "rgb(40,40,40)"}} title={<Title style={{color:"white"}} level={4}>Coach</Title>}>
                        <Statistic value={coach.name} valueStyle={{color:"rgb(100,218,225)",fontWeight:"bold"}}/>
                        <Paragraph style={{color:"white",marginTop:10}}><MailOutlined /> {coach.email}</Paragraph>
                        <Paragraph style={{color:"white"}}><PhoneOutlined /> (91)99999 99999</Paragraph>
                    </Card>

                    <ProgramDescription program={program} programStore={this.store} />

                    <Milestones program={program} programStore={this.store} apiProxy={this.props.appStore.apiProxy} />

                    {this.renderActorCoachingPlan()}

                    <ProgramSessions programId={program.id} apiProxy={this.props.appStore.apiProxy} showSessionDetail={this.showSessionDetail} />
                </div>

                <EnrollmentModal programStore={this.store} enrollmentStore={this.enrollmentStore} />
            </>
        )
    }
}
export default ProgramDetailUI;
