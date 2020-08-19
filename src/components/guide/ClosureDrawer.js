import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ClosureForm from './ClosureForm';

@observer
class ClosureDrawer extends Component {

    close = () => {
        const store = this.props.sessionStore;
        store.showClosureDrawer = false;
    }

   
    render() {
        const store = this.props.sessionStore;
        const title = store.targetState==="DONE" ? "Completion Details" : "Cancellation Details";

        return (
            <Drawer title={title} width={"45%"} closable={true} onClose={this.close} visible={store.showClosureDrawer} destroyOnClose>
                <ClosureForm sessionStore = {store}/>
            </Drawer>
        );
    }
}
export default ClosureDrawer