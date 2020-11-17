import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer,Typography } from 'antd';

import ActionClosureForm from './ActionClosureForm';

const { Title } = Typography;

const taskTitleStyle = { color: "rgb(59,109,171)", textAlign: "center" };

@observer
class ActionClosureDrawer extends Component {

    close = () => {
        const store = this.props.taskStore;
        store.showClosureDrawer = false;
    }
   
    render() {
        const store = this.props.taskStore;
        const title = "Closure of activity";
        const name = store.currentTask.name;

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showClosureDrawer} destroyOnClose>
                <Title level={5} style={taskTitleStyle}>{name}</Title>
                <ActionClosureForm taskStore = {store}/>
            </Drawer>
        );
    }
}
export default ActionClosureDrawer