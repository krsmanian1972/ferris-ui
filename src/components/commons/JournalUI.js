import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { PageHeader, Tabs, Tag,Tooltip,Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import SessionListStore from '../stores/SessionListStore';
import ProgramListStore from '../stores/ProgramListStore';
import EnrollmentListStore from '../stores/EnrollmentListStore';
import SessionStore from '../stores/SessionStore';

import ScheduleDrawer from '../guide/ScheduleDrawer';

import LegacyPlan from '../plan/LegacyPlan';
import ActionList from '../plan/ActionList';
import SessionReport from './SessionReport';
import NoteMatrix from './NoteMatrix';
import BoardMatrix from './BoardMatrix';
import MessageBoard from './MessageBoard';

import { pageHeaderStyle, pageTitle } from '../util/Style';

const { TabPane } = Tabs;

const tabBarStyle = {
    color: "rgb(69,49,28)",
    fontWeight: "bold",
}

@inject("appStore")
@observer
class JournalUI extends Component {
    constructor(props) {
        super(props);
        this.journalContext = props.params.journalContext;
        this.isCoach = (props.params.journalContext.coachId === props.appStore.apiProxy.getUserFuzzyId());
  
        this.programListStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });
        this.enrollmentListStore = new EnrollmentListStore({ apiProxy: props.appStore.apiProxy });
        this.sessionListStore = new SessionListStore({ apiProxy: props.appStore.apiProxy });

        this.sessionStore = new SessionStore({
            apiProxy: props.appStore.apiProxy,
            programListStore: this.programListStore,
            enrollmentListStore: this.enrollmentListStore,
            sessionListStore: this.sessionListStore,
        });
    }

    showSessionDetail = (event) => {
        event.coachId = this.journalContext.coachId;
        const params = { event: event, parentKey: "JournalUI" };
        this.props.appStore.currentComponent = { label: "Session Detail", key: "sessionDetail", params: params };
    }

    showNewSchedule = () => {
        this.sessionStore.startTimeMsg = {};
        this.sessionStore.durationMsg = {};
        this.sessionStore.sessionType = "mono"; 
        this.sessionStore.showDrawer = true;
    }

    newScheduleButton = () => {
        if (this.isCoach) {
            return (
                <Tooltip key="new_session_tip" title="Create One-On-One Session">
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => this.showNewSchedule()}>1-On-1</Button>
                </Tooltip>
            )
        }
    }

    showPeople = () => {
        const people = `${this.journalContext.coachName}::${this.journalContext.memberName}`;
        return (
                <Tag key="people" color="rgb(69,49,28)">{people}</Tag>
        )
    }

    render() {

        return (
            <PageHeader
                style={pageHeaderStyle}
                title={pageTitle(this.journalContext.programName)}
                extra={[
                    this.showPeople(),
                    this.newScheduleButton(),
                ]}>
                <div className="journal-container">
                    <Tabs defaultActiveKey='6' tabBarStyle={tabBarStyle} tabPosition="left">
                        <TabPane tab="Plan" key="1">
                            <LegacyPlan key="gt" isCoach={this.isCoach} enrollmentId={this.journalContext.enrollmentId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} />
                        </TabPane>

                        <TabPane tab="Actions" key="2">
                            <ActionList key="tt" isCoach={this.isCoach} enrollmentId={this.journalContext.enrollmentId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} />
                        </TabPane>

                        <TabPane tab="Sessions" key="3">
                            <SessionReport key="sr" programId={this.journalContext.programId} userId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} showSessionDetail={this.showSessionDetail} />
                        </TabPane>

                        <TabPane tab="Notes" key="4">
                            <NoteMatrix key="note_matrix" enrollmentId={this.journalContext.enrollmentId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} />
                        </TabPane>

                        <TabPane tab="Boards" key="5">
                            <BoardMatrix key="board_matrix" enrollmentId={this.journalContext.enrollmentId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} programId={this.journalContext.programId} />
                        </TabPane>

                        <TabPane tab="Messages" key="6">
                            <MessageBoard key="message" journalContext={this.journalContext} apiProxy={this.props.appStore.apiProxy} />
                        </TabPane>

                    </Tabs>
                </div>
                <ScheduleDrawer sessionStore={this.sessionStore} programId={this.journalContext.programId} memberId={this.journalContext.memberId}/>
            </PageHeader>
        )
    }
}
export default JournalUI
