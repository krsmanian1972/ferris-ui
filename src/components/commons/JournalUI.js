import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { PageHeader, Typography, Tabs,Tag } from 'antd';

import GoldenTemplate from '../guide/GoldenTemplate';
import ProgramSessions from './ProgramSessions';
import NoteMatrix from './NoteMatrix';
import BoardMatrix from './BoardMatrix';

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
            <Tag color="rgb(69,49,28)">{people}</Tag>
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

                    <TabPane tab="Notes" key="3">
                        <NoteMatrix key="note_matrix" enrollmentId={this.journalContext.enrollmentId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} />
                    </TabPane>

                    <TabPane tab="Boards" key="4">
                        <p>Please use the session to access the boards.</p>
                        <p>We are working on offering the consolidated boards.</p>
                        <BoardMatrix key="journal_board" programId={this.journalContext.programId} memberId={this.journalContext.memberId} apiProxy={this.props.appStore.apiProxy} />
                    </TabPane>
                </Tabs>

            </PageHeader>
        )
    }
}
export default JournalUI
