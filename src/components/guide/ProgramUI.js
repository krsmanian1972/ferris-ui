import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Tabs, Typography, Tooltip, Button, Tag } from 'antd';
import { PlusCircleOutlined, ThunderboltOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';

import ProgramListStore from '../stores/ProgramListStore';
import ProgramStore from '../stores/ProgramStore';

import ProgramDeck from '../commons/ProgramDeck';
import ProgramList from './ProgramList';
import ProgramDrawer from './ProgramDrawer';

const { TabPane } = Tabs;
const { Title } = Typography;

const DESIRE_YOURS = "YOURS";
const DESIRE_EXPLORE = "EXPLORE";
const DESIRE_ENROLLED = "ENROLLED";

@inject("appStore")
@observer
class ProgramUI extends Component {
    constructor(props) {
        super(props);
        this.listStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });
        this.store = new ProgramStore({
            apiProxy: props.appStore.apiProxy,
            programListStore: this.listStore
        })
    }

    componentDidMount() {
        this.listStore.fetchPrograms(DESIRE_EXPLORE);  
    }

    new = () => {
        this.store.showDrawer = true;
    }

    showProgramDetail = (programFuzzyId) => {
        const params = { programFuzzyId: programFuzzyId, parentKey: "programs" };
        this.props.appStore.currentComponent = { label: "Program Detail", key: "programDetail", params: params };
    }

    /**
     * Provide the count Tag only if the store is in Done State
     */
    countTag = () => {
        if (this.listStore.isDone) {
            return <Tag color="#108ee9">{this.listStore.rowCount} Total</Tag>
        }

        if (this.listStore.isError) {
            return <Tag color="red">...</Tag>
        }

        if (this.listStore.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    refreshList = (desire) => {
        this.listStore.fetchPrograms(desire);
    }
    addProgramButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="new_program_tip" title="Create Program">
                    <Button key="add" onClick={this.new} type="primary" icon={<PlusCircleOutlined />}>New</Button>
                </Tooltip>
            );
        }
    }

    render() {
        return (
            <>
                <ProgramDeck programListStore={this.listStore} showProgramDetail={this.showProgramDetail} />

                <Tabs
                    defaultActiveKey={DESIRE_EXPLORE}
                    onChange={this.refreshList}
                    tabPosition="top"
                    style={{ minHeight: 450 }}
                    tabBarExtraContent={this.addProgramButton()}>

                    {this.props.appStore.isCoach && (
                        <TabPane key={DESIRE_YOURS} tab={<span><BookOutlined />Yours</span>} style={{ maxHeight: 450, overflow: "auto" }}>
                            <ProgramList programListStore={this.listStore} showProgramDetail={this.showProgramDetail} desire={DESIRE_YOURS} />
                        </TabPane>
                    )}

                    <TabPane key={DESIRE_ENROLLED} tab={<span><ThunderboltOutlined />Enrolled</span>} style={{ maxHeight: 450, overflow: "auto" }}>
                        <ProgramList programListStore={this.listStore} showProgramDetail={this.showProgramDetail} desire={DESIRE_ENROLLED} />
                    </TabPane>

                    <TabPane key={DESIRE_EXPLORE} tab={<span><SearchOutlined />Explore</span>} style={{ maxHeight: 450, overflow: "auto" }}>
                        <ProgramList programListStore={this.listStore} showProgramDetail={this.showProgramDetail} desire={DESIRE_EXPLORE} />
                    </TabPane>
                </Tabs>



                <ProgramDrawer programStore={this.store} />

            </>
        )
    }
}
export default ProgramUI;
