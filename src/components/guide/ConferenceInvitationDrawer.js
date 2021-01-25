import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ConferenceInvitationForm from './ConferenceInvitationForm';

@observer
class ConferenceInvitationDrawer extends Component {

    close = () => {
        const store = this.props.sessionStore;
        store.showInvitationDrawer = false;
    }

    render() {
        const store = this.props.sessionStore;

        const title = "Include an enrolled member in this conference";

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showInvitationDrawer} destroyOnClose>
                <ConferenceInvitationForm sessionStore={store} />
            </Drawer>
        );
    }
}
export default ConferenceInvitationDrawer