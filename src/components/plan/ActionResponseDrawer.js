import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer,Typography } from 'antd';

import ActionResponseForm from './ActionResponseForm';

const { Title } = Typography;

const taskTitleStyle = { color: "rgb(59,109,171)", textAlign: "center" };

@observer
class ActionResponseDrawer extends Component {

    close = () => {
        const store = this.props.taskStore;
        store.showResponseDrawer = false;
    }
   
    render() {
        const store = this.props.taskStore;
        const title = "Response to activity";
        const name = store.currentTask.name;

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showResponseDrawer} destroyOnClose>
                <Title level={5} style={taskTitleStyle}>{name}</Title>
                <ActionResponseForm taskStore = {store}/>
            </Drawer>
        );
    }
}
export default ActionResponseDrawer