import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ObjectiveForm from './ObjectiveForm';

@observer
class ObjectiveDrawer extends Component {

    close = () => {
        const store = this.props.objectiveStore;
        store.showDrawer = false;
    }
   
    render() {
        const store = this.props.objectiveStore;
        const title = "New Objective";

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <ObjectiveForm objectiveStore = {store}/>
            </Drawer>
        );
    }
}
export default ObjectiveDrawer