import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import PlanForm from './PlanForm';

@observer
class PlanDrawer extends Component {

    close = () => {
        const store = this.props.planStore;
        store.showDrawer = false;
    }

   
    render() {
        const store = this.props.planStore;
        store.setNewPlan();
        const title = "New Plan";
        
        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <PlanForm planStore = {store}/>
            </Drawer>
        );
    }
}
export default PlanDrawer