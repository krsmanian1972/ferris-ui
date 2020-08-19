import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ClosureForm from './ClosureForm';

@observer
class ClosureDrawer extends Component {

    close = () => {
        this.props.store.showClosureDrawer = false;
    }

   
    render() {
        const title = this.props.store.targetState==="DONE" ? "Completion Details" : "Cancellation Details";

        return (
            <Drawer title={title} width={"45%"} closable={true} onClose={this.close} visible={this.props.store.showClosureDrawer} destroyOnClose>
                <ClosureForm store = {this.props.store}/>
            </Drawer>
        );
    }
}
export default ClosureDrawer