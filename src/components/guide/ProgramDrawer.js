import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer,Typography } from 'antd';

import ProgramForm from './ProgramForm';

import { PRIVATE_PROGRAM_INFO, PUBLIC_PROGRAM_INFO } from '../stores/ProgramStore';

const {Text} = Typography;

@observer
class ProgramDrawer extends Component {

    close = () => {
        const store = this.props.programStore;
        store.showDrawer = false;
    }

    getInfo = () => {
        const store = this.props.programStore;

        const programType = store.isPrivate===true? "Private Program" : "Public Program";
        const info = store.isPrivate===true? PRIVATE_PROGRAM_INFO : PUBLIC_PROGRAM_INFO;

        return (
            <>
                <Text strong>{programType}: </Text>
                <Text>{info}</Text>
            </>
        )
    }
   
    render() {
        const store = this.props.programStore;
        const title = "Preliminary Information about the Program"; 

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <ProgramForm programStore = {store} />
                {this.getInfo()}
            </Drawer>
        );
    }
}
export default ProgramDrawer