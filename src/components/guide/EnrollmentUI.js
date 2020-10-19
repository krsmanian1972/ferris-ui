import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { PageHeader, Typography, Collapse, Tag } from 'antd';

import MemberListStore from '../stores/MemberListStore';
import SessionListStore from '../stores/SessionListStore';

import MemberList from './MemberList';

import { pageHeaderStyle, pageTitle } from '../util/Style';

const { Title } = Typography;
const { Panel } = Collapse;

@inject("appStore")
@observer
class EnrollmentUI extends Component {

    constructor(props) {
        super(props);
        this.memberListStore = new MemberListStore({ apiProxy: props.appStore.apiProxy });
    }

    showJournalUI = (memberItem) => {

        const journalContext = {
            programId: memberItem.program.id,
            programName: memberItem.program.name,
            coachName: memberItem.program.coachName,
            memberName: memberItem.user.name,
            memberId: memberItem.user.id,
            enrollmentId: memberItem.enrollment.id,
        };

        const params = { journalContext: { ...journalContext }, parentKey: "enrollmentUI" };

        this.props.appStore.currentComponent = { label: "Journal", key: "journal", params: params };
    }


    countTag = () => {
        const store = this.memberListStore
        if (store.isDone) {
            return <Tag color="#108ee9">{store.rowCount} Members</Tag>
        }

        if (store.isError) {
            return <Tag color="red">...</Tag>
        }
    }


    render() {

        return (
            <PageHeader
                style={pageHeaderStyle}
                title={pageTitle("Enrollments")}
                extra={[
                    this.countTag()
                ]}>
                <MemberList key="members" store={this.memberListStore} showJournalUI={this.showJournalUI} />
            </PageHeader>
        )
    }
}

export default EnrollmentUI
