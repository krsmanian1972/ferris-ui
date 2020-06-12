import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import ChatStore from '../stores/ChatStore';

import Broadcast from './Broadcast';
import ProgramUI from './ProgramUI';

@inject("appStore")
@observer
class HomeUI extends Component {
    constructor(props) {
        super(props);
        this.chatStore = new ChatStore();
    }

    render() {
        return (
            <ProgramUI />
        )
    }
}

export default HomeUI
