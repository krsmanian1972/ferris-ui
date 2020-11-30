import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button } from 'antd';
import { PlusCircleOutlined, AccountBookOutlined, CompassOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import ReactPlayer from 'react-player';

import { assetHost } from '../stores/APIEndpoints';
import ProgramStore from '../stores/ProgramStore';
import EnrollmentStore from '../stores/EnrollmentStore';

import ProgramDescription from './ProgramDescription';
import EnrollmentModal from './EnrollmentModal';
import AboutCoach from './AboutCoach';
import Milestones from '../guide/Milestones';

import { cardHeaderStyle, pageHeaderStyle, pageTitle } from '../util/Style';

const { Title } = Typography;

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

    getEnrollmentButton = () => {
        if (!this.store.canEnroll) {
            return;
        }
        return (
            <Tooltip key="new_enrollment_tip" title="Enroll into this program">
                <Button key="enroll" onClick={this.onEnroll} type="primary" icon={<PlusCircleOutlined />}>Enroll</Button>
            </Tooltip>
        );
    }

    /**
     * Show the Journal Button Only to the Enrolled member.
     * The Journal is at the enrollment level.
     */
    getJournalButton = () => {
        if (this.store.isPeerCoach) {
            return;
        }

        if (!this.store.isEnrolled) {
            return;
        }

        return (
            <Tooltip key="journal_tip" title="View all your sessions and notes.">
                <Button key="journ" onClick={this.showJournalUI} type="primary" icon={<AccountBookOutlined />}>Journal</Button>
            </Tooltip>
        );
    }

    /**
     * A mmeber can request a session with the coach from this page.
     *
     * The Prerequisite is that the user should be
     * enrolled into the program.
     */
    getDiscussionButton = () => {
        if (this.store.isPeerCoach) {
            return;
        }

        if (!this.store.isEnrolled) {
            return;
        }

        return (
            <Tooltip key="req_tip" title="Request a session with the coach of this program">
                <Button key="ses_req" onClick={this.showDiscussionUI} type="primary" icon={<CompassOutlined />}>Discussion</Button>
            </Tooltip>
        );
    }

    onEnroll = () => {
        this.enrollmentStore.showEnrollmentModal = true;
    }

    getJournalContext = () => {

        const { program, coach, enrollmentId } = this.store.programModel;
        const memberId = this.props.appStore.apiProxy.getUserFuzzyId();
        const memberName = this.props.appStore.credentials.username;

        const journalContext = {
            programId: program.id,
            programName: program.name,
            coachName: coach.name,
            coachId: coach.id,
            memberName: memberName,
            memberId: memberId,
            enrollmentId: enrollmentId,
        };

        return journalContext;
    }


    showDiscussionUI = () => {

        const context = this.getJournalContext();
        const params = { journalContext: { ...context }, parentKey: "programDetailUI" };

        this.props.appStore.currentComponent = { label: "Discussion", key: "discussion", params: params };
    }

    showJournalUI = () => {

        const context = this.getJournalContext();
        const params = { journalContext: { ...context }, parentKey: "programDetailUI" };

        this.props.appStore.currentComponent = { label: "Journal", key: "journal", params: params };
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

    /**
     * The program trailer should be avilable with the parent program
     * @param {*} program 
     * @param {*} change 
     */
    getTrailer = (program, change) => {
        const url = `${assetHost}/programs/${program.parentProgramId}/trailer/trailer.mp4`;
        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px", marginTop: "10px" }} title={<Title level={4}>Trailer</Title>}>
                <div className='trailer-wrapper'>
                    <ReactPlayer width='100%' height='100%' controls className='trailer' url={url} />
                </div>
            </Card>
        )
    }

   
    /**
     * The poster of the spawned programs are still with the parentProgram
     * @param {*} program 
     * @param {*} change 
     */
    getProgramPoster = (program, change) => {
        const url = `${assetHost}/programs/${program.parentProgramId}/poster/poster.png`;
        return (
            <Card>
                <div style={{ textAlign: "center", height: 350 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 350 }}></div>
                    <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={url} />
                </div>
            </Card>
        )
    }

    renderProgramModel = () => {

        const { program, coach } = this.store.programModel;
        const change = this.store.change;

        return (
            <>
                <PageHeader
                    style={pageHeaderStyle}
                    title={pageTitle(program.name)}
                    extra={[
                        this.getEnrollmentButton(),
                        this.getJournalButton(),
                        this.getDiscussionButton(),
                    ]}>

                    {this.getProgramPoster(program, change)}

                    {this.getTrailer(program, change)}

                    <ProgramDescription program={program} programStore={this.store} />

                    <AboutCoach coach={coach} appStore={this.props.appStore}/>
                    
                    <Milestones program={program} programStore={this.store} apiProxy={this.props.appStore.apiProxy} />

                </PageHeader>

                <EnrollmentModal programStore={this.store} enrollmentStore={this.enrollmentStore} />
            </>
        )
    }
}
export default ProgramDetailUI;
