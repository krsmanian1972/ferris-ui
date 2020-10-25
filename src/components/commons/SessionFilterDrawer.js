import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import SessionFilterForm from './SessionFilterForm';

@observer
class SessionFilterDrawer extends Component {

    close = () => {
        const store = this.props.store;
        store.showDrawer = false;
    }
   
    render() {
        const store = this.props.store;
        const title = "Session Report - Parameters"

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <SessionFilterForm programId={this.props.programId} userId={this.props.userId} store={store} />
            </Drawer>
        );
    }
}
export default SessionFilterDrawer