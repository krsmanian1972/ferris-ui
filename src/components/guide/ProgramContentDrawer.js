import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';

import ProgramContentForm from './ProgramContentForm';

@observer
export default class ProgramContentDrawer extends Component {

    constructor(props) {
        super(props);
    }

    close = () => {
        const store = this.props.programStore;
        store.showContentDrawer = false;
    }


    render() {
        const store = this.props.programStore;
        const { program } = store.programModel;

        const title = "Video and Images of the Program";

        return (
            <Drawer title={title} width={"45%"} closable={true} onClose={this.close} visible={store.showContentDrawer} destroyOnClose>
                <ProgramContentForm program={program} onContentChange={this.props.onContentChange} />
            </Drawer>
        );
    }
}