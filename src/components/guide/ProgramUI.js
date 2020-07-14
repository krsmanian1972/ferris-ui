import React, { Component } from 'react';
import { inject,observer } from 'mobx-react';

import {PageHeader, Tooltip, Button} from 'antd';
import { PlusCircleOutlined} from '@ant-design/icons';

import ProgramListStore from '../stores/ProgramListStore';
import ProgramStore from '../stores/ProgramStore';

import ProgramList from './ProgramList';
import ProgramDrawer from './ProgramDrawer';


@inject("appStore")
@observer
class ProgramUI extends Component {
    constructor(props) {
        super(props);
        this.listStore = new ProgramListStore({apiProxy: props.appStore.apiProxy});
        this.store = new ProgramStore({
            apiProxy: props.appStore.apiProxy,
            programListStore: this.listStore
        })
    }

    new = () => {
       this.store.showDrawer=true; 
    }

    render() {
        return (
            <>
                <PageHeader title="Your Programs"
                    extra={[
                        <Tooltip key="new_program_tip" title="Create Program">
                            <Button key="add" onClick={this.new} type="primary" icon={<PlusCircleOutlined/>}>New</Button>
                        </Tooltip>,
                    ]}>
                </PageHeader>

                <ProgramList programListStore = {this.listStore}/>
                
                <ProgramDrawer programStore = {this.store}/>    
                
            </>    
        )
    }
}
export default ProgramUI;
