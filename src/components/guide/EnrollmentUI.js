import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { PageHeader, Typography, Collapse, Tag } from 'antd';

import MemberListStore from '../stores/MemberListStore';
import SessionListStore from '../stores/SessionListStore';

import MemberList from './MemberList';
import MemberSessions from './MemberSessions';

import { pageHeaderStyle,pageTitle } from '../util/Style';

const { Title } = Typography;
const { Panel } = Collapse;

@inject("appStore")
@observer
class EnrollmentUI extends Component {

    constructor(props) {
        super(props);
        this.memberListStore = new MemberListStore({ apiProxy: props.appStore.apiProxy });
        this.sessionListStore = new SessionListStore({ apiProxy: props.appStore.apiProxy });
    }

    showSessionDetail = (event) => {
        const params = { event: event, parentKey: "programDetailUI" };
        this.props.appStore.currentComponent = { label: "Session Detail", key: "sessionDetail", params: params };
    }

    showMemberSessions = (memberItem) => {

        const selection = {
            userName: memberItem.user.name,
            userId: memberItem.user.Id,
            email: memberItem.user.email,
            programName: memberItem.program.name,
            programId: memberItem.program.id
        };

        this.sessionListStore.fetchProgramSessions(memberItem.program.id, memberItem.user.id, selection);
    }

    countTag = () => {
        const store = this.memberListStore
        if (store.isDone) {
            return <Tag color="#108ee9">{store.rowCount} Total</Tag>
        }

        if (store.isError) {
            return <Tag color="red">...</Tag>
        }
    }


    render() {

        return (
            <PageHeader 
                style={pageHeaderStyle} 
                title={pageTitle("Enrollments")}> 
                <Collapse bordered={true} defaultActiveKey={['1']}>
                    <Panel key="1" header={<Title level={4}>Members {this.countTag()}</Title>}>
                        <MemberList key="members" store={this.memberListStore} showMemberSessions={this.showMemberSessions} />
                    </Panel>
                </Collapse>
                <MemberSessions key="sessions" store={this.sessionListStore} showSessionDetail={this.showSessionDetail}/>
            </PageHeader>
        )
    }
}

export default EnrollmentUI
