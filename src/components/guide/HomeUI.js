import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { PageHeader, Typography, Button, Tooltip } from 'antd';
import { PlusCircleOutlined, UserOutlined } from '@ant-design/icons';

import TodaySessions from './TodaySessions';

import SessionListStore from '../stores/SessionListStore';
import SessionStore from '../stores/SessionStore';

import ScheduleDrawer from './ScheduleDrawer';
import ProgramListStore from '../stores/ProgramListStore';
import EnrollmentListStore from '../stores/EnrollmentListStore';

const { Title } = Typography;


@inject("appStore")
@observer
class HomeUI extends Component {
    constructor(props) {
        super(props);

        this.programListStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });
        this.enrollmentListStore = new EnrollmentListStore({ apiProxy: props.appStore.apiProxy });
        this.sessionListStore = new SessionListStore({ apiProxy: props.appStore.apiProxy });

        this.sessionStore = new SessionStore({
            apiProxy: props.appStore.apiProxy,
            enrollmentListStore: this.enrollmentListStore,
            sessionListStore: this.sessionListStore,
            programListStore: this.programListStore
        });
    }

    showSessionDetail = (event) => {
        const params = { event: event, parentKey: "home" };
        this.props.appStore.currentComponent = { label: "Session Detail", key: "sessionDetail", params: params };
    }

    showNewSchedule = () => {
        this.sessionStore.startTimeMsg = {};
        this.sessionStore.durationMsg = {};
        this.sessionStore.showDrawer = true;
    }

    showEnrollments = () => {
        const params = { event: {}, parentKey: "home" };
        this.props.appStore.currentComponent = { label: "Enrollments", key: "enrollments", params: params };
    }

    newScheduleButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="new_session_tip" title="Create Session">
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => this.showNewSchedule()}>New</Button>
                </Tooltip>
            )
        }
    }

    membersButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="members_tip" title="Enrolled Members">
                    <Button type="primary" icon={<UserOutlined />} onClick={this.showEnrollments}>Enrollments</Button>
                </Tooltip>
            )
        }
    }

    render() {
        return (
            <>
                <PageHeader 
                    style={{ marginBottom: 5, paddingBottom: 0, paddingTop: 0 }} 
                    title={<Title level={3}>Moment 36</Title>}
                    extra={[
                        this.newScheduleButton(),
                        this.membersButton()
                    ]}>

                    <div>
                        <TodaySessions sessionListStore={this.sessionListStore} sessionStore={this.sessionStore} showSessionDetail={this.showSessionDetail} />
                    </div>
                </PageHeader>

                <ScheduleDrawer sessionStore={this.sessionStore} />
            </>
        )
    }
}
export default HomeUI
