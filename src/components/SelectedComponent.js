import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import Login from './LoginScreen';
import About from './About';
import WorkflowUI from './guide/WorkflowUI';
import HomeUI from './guide/HomeUI';
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
            case 'programs': {
                return <About />;
            }
            case 'planning': {
                return <WorkflowUI />;
            }
            case 'login': {
                return <Login />;
            }
            case 'broadcast' : {
                return <Broadcast />
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