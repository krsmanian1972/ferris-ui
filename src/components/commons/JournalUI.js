import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { PageHeader, Typography, Tabs,Tag } from 'antd';

import GoldenTemplate from '../guide/GoldenTemplate';
import ProgramSessions from './ProgramSessions';
import SessionReport from './SessionReport';
import NoteMatrix from './NoteMatrix';

import { pageHeaderStyle, pageTitle } from '../util/Style';

const { Title } = Typography;

const { TabPane } = Tabs;

@inject("appStore")
@observer
class JournalUI extends Component {
    constructor(props) {
        super(props);
        this.journalContext = props.params.journalContext;
    }

    showSessionDetail = (event) => {
        event.readOnly = true;
        const params = { event: event, parentKey: "JournalUI" };
        this.props.appStore.currentComponent = { label: "Session Detail", key: "sessionDetail", params: params };
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
                    this.showPeople()
                ]}>
                <Tabs type="card">
                    <TabPane tab="Plan" key="1">
                        <GoldenTemplate key="gt" enrollmentId={this.journalContext.enrollmentId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} />
                    </TabPane>

                    <TabPane tab="Sessions" key="2">
                        <ProgramSessions programId={this.journalContext.programId} userId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} showSessionDetail={this.showSessionDetail} />
                    </TabPane>

                    <TabPane tab="Report" key="3">
                        <SessionReport programId={this.journalContext.programId} userId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} showSessionDetail={this.showSessionDetail} />
                    </TabPane>

                    <TabPane tab="Notes" key="4">
                        <NoteMatrix key="note_matrix" enrollmentId={this.journalContext.enrollmentId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} />
                    </TabPane>

                    <TabPane tab="Boards" key="5">
                        <p>Please use the session to access the boards.</p>
                        <p>We are working on offering the consolidated boards.</p>
                    </TabPane>
                </Tabs>

            </PageHeader>
        )
    }
}
export default JournalUI