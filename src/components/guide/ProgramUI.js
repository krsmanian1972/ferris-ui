import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Typography, Tooltip, Button, Tag, Card, Space } from 'antd';
import { LockOutlined, PlusCircleOutlined } from '@ant-design/icons';

import ProgramListStore from '../stores/ProgramListStore';
import ProgramStore, { PRIVATE_PROGRAM_INFO, PUBLIC_PROGRAM_INFO } from '../stores/ProgramStore';

import ProgramBanner from '../commons/ProgramBanner';
import ProgramList from '../commons/ProgramList';
import CoachProgramList from './CoachProgramList';
import ProgramDrawer from './ProgramDrawer';
import { cardHeaderStyle } from '../util/Style';

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

    newPrivateProgram = () => {
        this.store.isPrivate = true;
        this.store.showDrawer = true;
    }

    newPublicProgram = () => {
        this.store.isPrivate = false;
        this.store.showDrawer = true;
    }

    showProgramDetail = (programId) => {
        const params = { programId: programId, parentKey: "programs" };
        this.props.appStore.currentComponent = { label: "Program Detail", key: "programDetail", params: params };
    }

    showEditableProgramDetail = (programId) => {
        const params = { programId: programId, parentKey: "programs" };
        this.props.appStore.currentComponent = { label: "Program Detail", key: "editableProgramDetail", params: params };
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
                <div style={{ float: "right" }}>
                    <Space>
                        <Tooltip key="public_program_tip" title={PUBLIC_PROGRAM_INFO}>
                            <Button key="add_public" onClick={this.newPublicProgram} type="primary" icon={<PlusCircleOutlined />}>New Public Program</Button>
                        </Tooltip>

                        <Tooltip key="private_program_tip" title={PRIVATE_PROGRAM_INFO}>
                            <Button key="add_private" onClick={this.newPrivateProgram} type="primary" icon={<LockOutlined />} style={{ background: "green" }}>New Private Program</Button>
                        </Tooltip>
                    </Space>
                </div>
            );
        }
    }

    render() {

        return (
            <>
                <ProgramBanner programListStore={this.deckListStore} showProgramDetail={this.showProgramDetail} />

                {this.props.appStore.isCoach && (
                    <Card
                        headStyle={cardHeaderStyle}
                        style={{ marginLeft: 10, marginRight: 10, marginTop: "10px" }}
                        title={<Title level={4}>Yours {this.countTag(this.yourListStore)} {this.addProgramButton()}</Title>}>
                        <CoachProgramList programListStore={this.yourListStore} showProgramDetail={this.showEditableProgramDetail} />
                    </Card>
                )}

                {this.enrolledListStore.rowCount > 0 && (
                    <Card
                        headStyle={cardHeaderStyle}
                        style={{ marginLeft: 10, marginRight: 10, marginTop: "10px" }} title={<Title level={4}>Enrolled {this.countTag(this.enrolledListStore)} </Title>}>
                        <ProgramList programListStore={this.enrolledListStore} showProgramDetail={this.showProgramDetail} />
                    </Card>
                )}

                <Card
                    headStyle={cardHeaderStyle}
                    style={{ marginLeft: 10, marginRight: 10, marginTop: "10px" }} title={<Title level={4}>Explore</Title>}>
                    <ProgramList programListStore={this.exploreListStore} showProgramDetail={this.showProgramDetail} />
                </Card>

                <ProgramDrawer programStore={this.store} />
            </>
        )
    }
}
export default ProgramUI;
