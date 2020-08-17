import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ConstraintForm from './ConstraintForm';

@observer
class ConstraintDrawer extends Component {

    close = () => {
        const store = this.props.constraintStore;
        store.showDrawer = false;
    }
   
    render() {
        const store = this.props.constraintStore;

        const title = store.isNewOption ? "New Constraints and Options" : "Edit Constraints and Options";

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <ConstraintForm constraintStore = {store}/>
            </Drawer>
        );
    }
}
export default ConstraintDrawer