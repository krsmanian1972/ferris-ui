import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import Login from './LoginUI';
import PasswordReset from './PasswordReset';
import Registration from './Registration';

import About from './About';

import PlanHomeUI from './plan/PlanHomeUI';
import MasterPlanUI from './plan/MasterPlanUI';

import ProgramUI from './guide/ProgramUI';
import ProgramDetailUI from './commons/ProgramDetailUI';
import EditableProgramDetailUI from './guide/EditableProgramDetailUI';
import SessionDetailUI from './guide/SessionDetailUI';
import HomeUI from './guide/HomeUI';
import EnrollmentUI from './guide/EnrollmentUI';
import Broadcast from './guide/Broadcast';
import WeekSessions from './guide/WeekSessions';



@inject("appStore")
@observer
class SelectedComponent extends Component {

    evaluateComponent() {
        const currentComponent = this.props.appStore.currentComponent;
        if (!currentComponent) {
            return <Login />;
        }
        switch (currentComponent.key) {
            case 'home': {
                return <HomeUI />;
            }
            case 'enrollments': {
                return <EnrollmentUI />
            }
            case 'weekly': {
                return <WeekSessions />
            }
            case 'programs': {
                return <ProgramUI />;
            }
            case 'programDetail': {
                return <ProgramDetailUI params={currentComponent.params} />
            }
            case 'editableProgramDetail': {
                return <EditableProgramDetailUI params={currentComponent.params} />
            }
            case 'sessionDetail': {
                return <SessionDetailUI params={currentComponent.params} />
            }
            case 'planning': {
                return <PlanHomeUI />;
            }
            case 'masterPlan': {
                return <MasterPlanUI params={currentComponent.params} />;
            }
            case 'login': {
                return <Login />;
            }
            case 'passwordReset': {
                return <PasswordReset />;
            }
            case 'registration': {
                return <Registration />;
            }
            case 'broadcast': {
                return <Broadcast params={currentComponent.params} />
            }
            case 'about': {
                return <About />;
            }
            default: {
                return <About />;
            }
        }
    }

    render() {
        return (this.evaluateComponent());
    }
}


export default SelectedComponent;