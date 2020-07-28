import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ProgramForm from './ProgramForm';

@observer
class ProgramDrawer extends Component {

    close = () => {
        const store = this.props.programStore;
        store.showDrawer = false;
    }

   
    render() {
        const store = this.props.programStore;
        const title = "Preliminary Information about the Program"; 

        return (
            <Drawer title={title} width={"45%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <ProgramForm programStore = {store} />
            </Drawer>
        );
    }
}
export default ProgramDrawer