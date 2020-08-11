import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import TaskForm from './TaskForm';

@observer
class TaskDrawer extends Component {

    close = () => {
        const store = this.props.taskStore;
        store.showDrawer = false;
    }
   
    render() {
        const store = this.props.taskStore;
        const title = "New Task";

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <TaskForm taskStore = {store}/>
            </Drawer>
        );
    }
}
export default TaskDrawer