import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button, Statistic } from 'antd';
import { PlusCircleOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

import { assetHost } from '../stores/APIEndpoints';

import ProgramDescription from './ProgramDescription';
import EnrollmentModal from './EnrollmentModal';

import Milestones from '../guide/Milestones';
import ProgramSessions from './ProgramSessions';
import ProgramStore from '../stores/ProgramStore';
import EnrollmentStore from '../stores/EnrollmentStore';


@inject("appStore")
@observer
class ProgramDetailUI extends Component {

    constructor(props) {
        super(props);
        this.store = new ProgramStore({ apiProxy: props.appStore.apiProxy })
        this.enrollmentStore = new EnrollmentStore({ apiProxy: props.appStore.apiProxy });
    }

    componentDidMount() {
        this.load(this.props.params.programId);
    }

    load = async (programId) => {
        await this.store.load(programId);
    }

    getPosterUrl = (programId) => {
        return `${assetHost}/programs/${programId}/poster/poster.png`;
    }

    getTrailerUrl = () => {
        const programId = this.props.params.programId;
        return `${assetHost}/programs/${programId}/cover/cover.png`;
    }

    getEnrollmentButton = () => {
        if (!this.store.canEnroll) {
            return;
        }
        return (
            <Tooltip key="new_program_tip" title="Enroll into this program">
                <Button key="add" onClick={this.onEnroll} type="primary" icon={<PlusCircleOutlined />}>Enroll</Button>
            </Tooltip>
        );
    }

    onEnroll = () => {
        this.enrollmentStore.showEnrollmentModal = true;
    }

    showSessionDetail = (event) => {
        const params = {event:event, parentKey: "programDetailUI" };
        this.props.appStore.currentComponent = { label: "Session Detail", key: "sessionDetail", params: params };
    }

    render() {

        if (this.store.isLoading || this.store.state === "init") {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.store.isError) {
            return <Result status="warning" title={this.store.message.help} />
        }

        return this.renderProgramModel();
    }

    getProgramPoster = (program, change) => {
        const url = `${assetHost}/programs/${program.id}/poster/poster.png`;
        return (
            <div style={{ textAlign: "center", height: 450 }}>
                <div style={{ display: "inline-block", verticalAlign: "middle", height: 450 }}></div>
                <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block" }} src={url} />
            </div>
        )
    }

    renderProgramModel = () => {

        const { program, coach } = this.store.programModel;
        const change = this.store.change;

        return (
            <>
                <PageHeader title={<Title level={3}>{program.name}</Title>}
                    extra={[
                        this.getEnrollmentButton(),
                    ]}>

                    {this.getProgramPoster(program, change)}

                    <Card title={<Title level={4}>Coach</Title>} extra={<a href="#">More</a>}>
                        <Statistic value={coach.name} valueStyle={{ color: '#3f8600' }} />
                        <Paragraph><MailOutlined /> {coach.email}</Paragraph>
                        <Paragraph><PhoneOutlined /> (91)99999 99999</Paragraph>
                    </Card>

                    <ProgramDescription program={program} programStore={this.store} />
                    
                    <Milestones program={program} programStore={this.store} apiProxy={this.props.appStore.apiProxy}/>
                    
                    <ProgramSessions programId = {program.id} apiProxy={this.props.appStore.apiProxy} showSessionDetail = {this.showSessionDetail}/>
                    
                </PageHeader>

                <EnrollmentModal programStore={this.store} enrollmentStore={this.enrollmentStore} />
            </>
        )
    }
}
export default ProgramDetailUI;
