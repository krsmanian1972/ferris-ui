import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tabs, Drawer } from 'antd';

import NotesForm from './NotesForm';

const { TabPane } = Tabs;

@observer
class NotesDrawer extends Component {

    close = () => {
        const store = this.props.notesStore;
        store.showDrawer = false;
    }


    render() {
        const store = this.props.notesStore;
        const title = store.notesId === 0 ? "New Notes" : "Unknown";

        return (
            <Drawer height="50%" placement="bottom" closable={true} onClose={this.close} visible={store.showDrawer} >
                <Tabs defaultActiveKey="1" tabPosition="right" >
                    <TabPane key="1" tab="New">
                        <NotesForm notesStore={store} />
                    </TabPane>
                    <TabPane key="2" tab="Earlier">

                    </TabPane>
                </Tabs>
            </Drawer>
        );
    }
}
export default NotesDrawer