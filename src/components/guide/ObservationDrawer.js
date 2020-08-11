import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ObservationForm from './ObservationForm';

@observer
class ObservationDrawer extends Component {

    close = () => {
        const store = this.props.observationStore;
        store.showDrawer = false;
    }
   
    render() {
        const store = this.props.observationStore;
        const title = "New Observation";

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <ObservationForm observationStore = {store}/>
            </Drawer>
        );
    }
}
export default ObservationDrawer