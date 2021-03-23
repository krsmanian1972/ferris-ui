import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ScheduleForm from './ScheduleForm';

@observer
class ScheduleDrawer extends Component {

    close = () => {
        const store = this.props.sessionStore;
        store.showDrawer = false;
    }

   
    render() {
        const store = this.props.sessionStore;
        const title = store.sessionType === "mono" ? "New Session Scheduling" : "New Conference Scheduling";
        
        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <ScheduleForm sessionStore = {store} programId = {this.props.programId} memberId={this.props.memberId}/>
            </Drawer>
        );
    }
}
export default ScheduleDrawer