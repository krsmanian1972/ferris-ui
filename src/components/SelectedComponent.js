import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import Login from './LoginUI';
import PasswordReset from './PasswordReset';
import Registration from './Registration';

import About from './About';

import PlanningUI from './guide/PlanningUI';
import MasterPlanUI from './guide/MasterPlanUI';
import ProgramUI from './guide/ProgramUI';
import ProgramDetailUI from './commons/ProgramDetailUI';
import EditableProgramDetailUI from './guide/EditableProgramDetailUI';
import SessionDetailUI from './guide/SessionDetailUI';
import HomeUI from './guide/HomeUI';
import MemberList from './guide/MemberList';
import Broadcast from './guide/Broadcast';



@inject("appStore")
@observer
class SelectedComponent extends Component {

    evaluateComponent() {
        const currentComponent = this.props.appStore.currentComponent;
        if(!currentComponent)
        {
            return <Login />;
        }
        switch (currentComponent.key) {
            case 'home' : {
                return <HomeUI />;
            }
            case 'coachMembers' : {
                return <MemberList/>
            }
            case 'programs': {
                return <ProgramUI />;
            }
            case 'programDetail' : {
                return <ProgramDetailUI params={currentComponent.params}/>
            }
            case 'editableProgramDetail' : {
                return <EditableProgramDetailUI params={currentComponent.params}/>
            }
            case 'sessionDetail' : {
                return <SessionDetailUI params={currentComponent.params}/>
            }
            case 'planning': {
                return <PlanningUI />;
            }
            case 'masterPlan': {
                return <MasterPlanUI params={currentComponent.params}/>;
            }
            case 'login': {
                return <Login />;
            }
            case 'passwordReset' : {
                return <PasswordReset />;
            }
            case 'registration' : {
                return <Registration />;
            }
            case 'broadcast' : {
                return <Broadcast params={currentComponent.params}/>
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