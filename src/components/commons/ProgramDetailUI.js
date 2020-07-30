import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button, Statistic } from 'antd';
import { PlusCircleOutlined, MailOutlined, PhoneOutlined} from '@ant-design/icons';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

import { assetHost } from '../stores/APIEndpoints';

import ProgramDescription from './ProgramDescription';
import EnrollmentModal from './EnrollmentModal';

import CurrentSessionPlan from '../guide/CurrentSessionPlan';

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

    getPosterUrl = (programFuzzyId) => {
        return `${assetHost}/programs/${programFuzzyId}/poster/poster.png`;
    }

    getTrailerUrl = () => {
        const programFuzzyId = this.props.params.programFuzzyId;
        return `${assetHost}/programs/${programFuzzyId}/cover/cover.png`;
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
        const url = `${assetHost}/programs/${program.fuzzyId}/poster/poster.png`;
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
                </PageHeader>

                {this.getProgramPoster(program, change)}

                <Card bordered={false} title="Coach" extra={<a href="#">More</a>}>
                    <Statistic value={coach.name} valueStyle={{ color: '#3f8600' }} />
                    <Paragraph><MailOutlined /> {coach.email}</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 99999</Paragraph>
                </Card>

                <ProgramDescription program={program} programStore={this.store} />

                <Card title="Milestones">
                    <Card.Meta description="The milestones represent the high-level overview of the program. The actual coaching plan will be customized, based on the context of the enrolled member of this program. Of course, the coaching plan will be aligned continuously." style={{ marginBottom: 10, paddingBottom: 10 }} />
                    <CurrentSessionPlan />
                </Card>

                <Card title="Trailers">
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
