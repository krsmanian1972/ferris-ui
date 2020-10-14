import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer, Typography } from 'antd';

import InvitationForm from './InvitationForm';

const { Text } = Typography;

const info = "Please have the registered email of the guest member. On behalf of you, Ferris will send a mail, carrying your personalized message, to the registered member.";

@observer
class InvitationDrawer extends Component {

    close = () => {
        const store = this.props.store;
        store.showInvitationDrawer = false;
    }

    getInfo = () => {
        return (
            <>
                <Text strong>Note: </Text>
                <Text>{info}</Text>
            </>
        )
    }

    render() {
        const store = this.props.store;

        const title = "Invite a registered member";

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showInvitationDrawer} destroyOnClose>
                <InvitationForm programId={this.props.programId} programName={this.props.programName} store={store} listStore={this.props.listStore}/>
                {this.getInfo()}
            </Drawer>
        );
    }
}
export default InvitationDrawer