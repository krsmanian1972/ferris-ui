import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import ChatStore from '../stores/ChatStore';


import Broadcast from './Broadcast';


@inject("appStore")
@observer
class HomeUI extends Component {
    constructor(props) {
        super(props);
        this.chatStore = new ChatStore();
    }

    render() {
        return (
            <>
                <Broadcast chatStore={this.chatStore} />
            </>
        )
    }
}

export default HomeUI
