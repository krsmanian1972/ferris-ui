import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Tabs, Typography, Tooltip, Button, Tag } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import ProgramListStore from '../stores/ProgramListStore';
import ProgramStore from '../stores/ProgramStore';

import ProgramBanner from '../commons/ProgramBanner';
import ProgramList from './ProgramList';
import ProgramDrawer from './ProgramDrawer';

const { Title } = Typography;

const DECK = "EXPLORE";
const YOURS = "YOURS";
const ENROLLED = "ENROLLED";
const EXPLORE = "EXPLORE";

@inject("appStore")
@observer
class ProgramUI extends Component {
    constructor(props) {
        super(props);

        this.deckListStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });
        this.yourListStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });
        this.enrolledListStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });
        this.exploreListStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });

        this.refreshListStores();

        this.store = new ProgramStore({
            apiProxy: props.appStore.apiProxy,
            programListStore: this.yourListStore,
        });
    }


    refreshListStores = () => {
        this.deckListStore.fetchPrograms(DECK);
        this.yourListStore.fetchPrograms(YOURS);
        this.enrolledListStore.fetchPrograms(ENROLLED);
        this.exploreListStore.fetchPrograms(EXPLORE);
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
    countTag = (listStore) => {
        if (listStore.isDone) {
            return <Tag color="#108ee9">{listStore.rowCount} Total</Tag>
        }

        if (listStore.isError) {
            return <Tag color="red">...</Tag>
        }

        if (listStore.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    addProgramButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="new_program_tip" title="Create New Program">
                    <Button style={{float:"right"}} key="add" onClick={this.new} type="primary" icon={<PlusCircleOutlined />}>New</Button>
                </Tooltip>
            );
        }
    }

    render() {

        return (
            <>
                <ProgramBanner programListStore={this.deckListStore} showProgramDetail={this.showProgramDetail} />

                {this.props.appStore.isCoach && (
                    <>
                        <Title style={{ marginTop: 10 }} level={4}>Yours {this.countTag(this.yourListStore)} {this.addProgramButton()}</Title>
                        <ProgramList programListStore={this.yourListStore} showProgramDetail={this.showProgramDetail} />
                    </>
                )}

                {this.enrolledListStore.rowCount > 0 && (
                    <>
                        <Title style={{ marginTop: 10 }} level={4}>Enrolled {this.countTag(this.enrolledListStore)} </Title>
                        <ProgramList programListStore={this.enrolledListStore} showProgramDetail={this.showProgramDetail} />
                    </>
                )}

                <Title style={{ marginTop: 10 }} level={4}>Explore</Title>
                <ProgramList programListStore={this.exploreListStore} showProgramDetail={this.showProgramDetail} />

                <ProgramDrawer programStore={this.store} />
            </>
        )
    }
}
export default ProgramUI;
