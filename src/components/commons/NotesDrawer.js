import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tabs, Drawer } from 'antd';
import NoteList from './NoteList';
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
        const title =  "New Notes";

        return (
            <Drawer height="50%" placement="bottom" closable={true} onClose={this.close} visible={store.showDrawer} >
                <Tabs defaultActiveKey="1" tabPosition="right" >
                    <TabPane key="1" tab="New">
                        <NotesForm notesStore={store} />
                    </TabPane>
                    <TabPane key="2" tab="Earlier">
                        <NoteList sessionUserId = {this.props.sessionUserId} apiProxy={this.props.apiProxy}/>
                    </TabPane>
                </Tabs>
            </Drawer>
        );
    }
}
export default NotesDrawer