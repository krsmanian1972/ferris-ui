import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button, Statistic } from 'antd';
import { PlusCircleOutlined, RocketOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import CurrentSessionPlan from './CurrentSessionPlan';

const { Title, Paragraph, Text } = Typography;

import ProgramStore from '../stores/ProgramStore';

import EnrollmentModal from './EnrollmentModal';

import { assetHost } from '../stores/APIEndpoints';
import EnrollmentStore from '../stores/EnrollmentStore';

@inject("appStore")
@observer
class ProgramDetailUI extends Component {

    constructor(props) {
        super(props);
        this.store = new ProgramStore({apiProxy: props.appStore.apiProxy})
        this.enrollmentStore = new EnrollmentStore({apiProxy: props.appStore.apiProxy});
    }

    componentDidMount() {
        this.load(this.props.params.programFuzzyId);
    }

    load = async(programFuzzyId) => {
        await this.store.load(programFuzzyId);
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


    getActivationButton = () => {
        if (!this.store.canActivate) {
            return;
        }

        return (
            <Tooltip key="new_activation_tip" title="Activate this program, as you are the Coach.">
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

    onEnroll = async() => {
        this.enrollmentStore.showEnrollmentModal = true;
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
                    ]}>
                </PageHeader>

                <Card>
                    <Card.Meta description="About" style={{ marginBottom: 10 }} />
                    <Paragraph>{program.description}</Paragraph>
                </Card>

                <div key="programPoster" style={this.getProgramPoster()}></div>

                <Card>
                    <Statistic title="Coach" value={coach.name} valueStyle={{ color: '#3f8600' }} />
                    <Paragraph><MailOutlined />{coach.email}</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 99999</Paragraph>
                </Card>

                <Card>
                    <Card.Meta description="Outcome" style={{ marginBottom: 10 }} />
                    <Paragraph>
                        Rust is for people who crave speed and stability in a language. By speed, we mean the speed of the programs that you can create with Rust and the speed at which Rust lets you write them. The Rust compiler’s checks ensure stability through feature additions and refactoring. This is in contrast to the brittle legacy code in languages without these checks, which developers are often afraid to modify. By striving for zero-cost abstractions, higher-level features that compile to lower-level code as fast as code written manually, Rust endeavors to make safe code be fast code as well.
                    </Paragraph>
                    <Paragraph>
                        The Rust language hopes to support many other users as well; those mentioned here are merely some of the biggest stakeholders. Overall, Rust’s greatest ambition is to eliminate the trade-offs that programmers have accepted for decades by providing safety and productivity, speed and ergonomics. Give Rust a try and see if its choices work for you.
                    </Paragraph>
                </Card>

                <Card>
                    <Card.Meta description="Milestones" style={{ marginBottom: 10, paddingBottom: 10 }} />
                    <CurrentSessionPlan />
                </Card>

                <Card>
                    <Card.Meta description="Trailers from coach" style={{ marginBottom: 10 }} />
                    <Card
                        style={{ border: '1px solid lightgray' }}
                        cover={<img alt="cover" style={{ border: "1px solid lightgray" }} src={this.getTrailerUrl()} />}>
                    </Card>
                </Card>

                <EnrollmentModal programStore={this.store} enrollmentStore={this.enrollmentStore}/>
            </>
        )
    }
}
export default ProgramDetailUI;
