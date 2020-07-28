import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button, Statistic } from 'antd';
import { PlusCircleOutlined, RocketOutlined, MailOutlined, PhoneOutlined, BuildOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Title, Paragraph} = Typography;

import Editor from "../commons/Editor";

import { assetHost } from '../stores/APIEndpoints';

import CurrentSessionPlan from './CurrentSessionPlan';
import EnrollmentModal from './EnrollmentModal';

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
        this.load(this.props.params.programFuzzyId);
    }

    load = async (programFuzzyId) => {
        await this.store.load(programFuzzyId);
    }

    handleDescription = (value) => {
        const { program } = this.store.programModel;
        program.description = value;
    }

    getDescription = (program) => {
        if (program.active) {
            return <Editor value={program.description} readOnly={true}/>
        }

        return (
            <Editor value={program.description} onChange={this.handleDescription} />
        )
    }

    getCoverUrl = (programFuzzyId) => {
        return `${assetHost}/programs/${programFuzzyId}/poster/poster.png`;
    }

    getProgramPoster = () => {
        const programFuzzyId = this.props.params.programFuzzyId;
        const posterUrl = `url(${this.getCoverUrl(programFuzzyId)})`
        const style = {
            backgroundImage: posterUrl,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
            height: 450,
        }
        return style;
    }

    getContentButton = () => {
        if (!this.store.canActivate) {
            return;
        }

        return (
            <Tooltip key="new_cms_tip" title="Manage the contents like trailer, teasers, posters and thumbnail">
                <Button key="manageContents" onClick={this.onManageContent} type="primary" icon={<BuildOutlined />}>Manage Content</Button>
            </Tooltip>
        );
    }
    getActivationButton = () => {
        if (!this.store.canActivate) {
            return;
        }

        return (
            <Tooltip key="new_activation_tip" title="By activating this program, it will be visible to the world.">
                <Button key="activateProgram" onClick={this.onActivate} type="primary" icon={<RocketOutlined />}>Activate</Button>
            </Tooltip>
        );
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

    onActivate = () => {
        this.store.showActivationModal = true;
    }

    onEnroll = () => {
        this.enrollmentStore.showEnrollmentModal = true;
    }

    onManageContent = () => {

    }


    getTrailerUrl = () => {
        const programFuzzyId = this.props.params.programFuzzyId;
        return `${assetHost}/programs/${programFuzzyId}/cover/cover.png`;
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

    renderProgramModel = () => {

        const { program, coach } = this.store.programModel;

        return (
            <>
                <PageHeader title={<Title level={3}>{program.name}</Title>}
                    extra={[
                        this.getEnrollmentButton(),
                        this.getActivationButton(),
                        this.getContentButton()
                    ]}>
                </PageHeader>

                <div key="programPoster" style={this.getProgramPoster()}></div>

                <Card bordered={false} title="Coach" extra={<a href="#">More</a>}>
                    <Statistic value={coach.name} valueStyle={{ color: '#3f8600' }} />
                    <Paragraph><MailOutlined /> {coach.email}</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 99999</Paragraph>
                </Card>

                <Card title="About" extra={<a href="#">Edit</a>}>
                    {this.getDescription(program)}
                </Card>

                <Card title="Milestones" extra={<a href="#">Edit</a>}>
                    <Card.Meta description="The milestones represent the highlevel overview of the program. The actual coaching plan will be customized, based on the context of the enrolled member to this program. Of course, the coaching plan will be aligned continuously." style={{ marginBottom: 10, paddingBottom: 10 }} />
                    <CurrentSessionPlan />
                </Card>

                <Card title="Trailers" extra={<a href="#">Edit</a>}>
                    <Card
                        style={{ border: '1px solid lightgray' }}
                        cover={<img alt="cover" style={{ border: "1px solid lightgray" }} src={this.getTrailerUrl()} />}>
                    </Card>
                </Card>

                <EnrollmentModal programStore={this.store} enrollmentStore={this.enrollmentStore} />


            </>
        )
    }
}
export default ProgramDetailUI;
