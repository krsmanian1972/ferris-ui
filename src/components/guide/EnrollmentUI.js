import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { PageHeader, Typography } from 'antd';

import MemberListStore from '../stores/MemberListStore';
import SessionListStore from '../stores/SessionListStore';

import MemberList from './MemberList';
import MemberSessions from './MemberSessions';

const { Title } = Typography;

@inject("appStore")
@observer
class EnrollmentUI extends Component {

    constructor(props) {
        super(props);
        this.memberListStore = new MemberListStore({ apiProxy: props.appStore.apiProxy });
        this.sessionListStore = new SessionListStore({ apiProxy: props.appStore.apiProxy });
    }

    showMemberSessions = (memberItem) => {

        const selection = {
            userName: memberItem.user.name,
            userId: memberItem.user.Id,
            email:memberItem.user.email,
            programName: memberItem.program.name,
            programId: memberItem.program.id
        };

        this.sessionListStore.fetchProgramSessions(memberItem.program.id, memberItem.user.id, selection);
    }

    render() {

        return (
            <>
                <PageHeader style={{ marginBottom: 5, paddingBottom: 0, paddingTop: 0 }} title={<Title level={3}>Enrollments</Title>} />
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <MemberList key="members" store={this.memberListStore} showMemberSessions={this.showMemberSessions} />
                    <MemberSessions key="sessions" store={this.sessionListStore} />
                </div>
            </>
        )
    }
}

export default EnrollmentUI
