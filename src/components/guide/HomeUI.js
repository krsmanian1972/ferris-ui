import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { PageHeader, Button, Tooltip } from 'antd';
import { CalendarOutlined, PlusCircleOutlined } from '@ant-design/icons';

import TodaySessions from './TodaySessions';
import ScheduleDrawer from './ScheduleDrawer';

import SessionListStore from '../stores/SessionListStore';
import ProgramListStore from '../stores/ProgramListStore';
import EnrollmentListStore from '../stores/EnrollmentListStore';
import SessionStore from '../stores/SessionStore';

import { pageHeaderStyle, pageTitle } from '../util/Style';


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
        this.sessionStore.sessionType = "mono"; 
        this.sessionStore.showDrawer = true;
    }

    showNewConference = () => {
        this.sessionStore.startTimeMsg = {};
        this.sessionStore.durationMsg = {};
        this.sessionStore.sessionType = "multi";
        this.sessionStore.showDrawer = true;
    }
   
    showUserEvents = () => {
        const params = { event: {}, parentKey: "home" };
        this.props.appStore.currentComponent = { label: "UserEvents", key: "userEvents", params: params };
    }

    showWeeklySchedule = () => {
        const params = { event: {}, parentKey: "home" };
        this.props.appStore.currentComponent = { label: "Weekly", key: "weekly", params: params };
    }

    newScheduleButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="new_session_tip" title="Create One-On-One Session">
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => this.showNewSchedule()}>New 1-On-1</Button>
                </Tooltip>
            )
        }
    }

    newConferenceButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="new_conference_tip" title="Create a conference session and invite multiple members.">
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => this.showNewConference()}>New Conference</Button>
                </Tooltip>
            )
        }
    }

    eventsButton = () => {
        return (
            <Tooltip key="ev_tp" title="All your events">
                <Button type="primary" icon={<CalendarOutlined />} onClick={this.showUserEvents}>Events</Button>
            </Tooltip>
        )
    }

    weeklySchedule = () => {
        return (
            <Tooltip key="week_tip" title="The weekly view of schedule.">
                <Button type="primary" icon={<CalendarOutlined />} onClick={this.showWeeklySchedule}>Weekly</Button>
            </Tooltip>
        )
    }

    render() {
        return (
            <>
                <PageHeader
                    style={pageHeaderStyle}
                    title={pageTitle("Moment 36")}
                    extra={[
                        this.newScheduleButton(),
                        this.newConferenceButton(),
                        this.eventsButton(),
                    ]}>
                    <TodaySessions sessionListStore={this.sessionListStore} sessionStore={this.sessionStore} showSessionDetail={this.showSessionDetail} />
                </PageHeader>

                <ScheduleDrawer sessionStore={this.sessionStore} />
            </>
        )
    }
}
export default HomeUI
