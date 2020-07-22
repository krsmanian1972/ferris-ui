import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';


@observer
class EnrollmentDrawer extends Component {

    close = () => {
        const store = this.props.programStore;
        store.showDrawer = false;
    }

   
    render() {
        const store = this.props.programStore;
        const title = "Enroll a Member Here"; 

        return (
            <Drawer title={title} width={"45%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                
            </Drawer>
        );
    }
}
export default EnrollmentDrawer