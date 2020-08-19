import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button, Statistic, Upload } from 'antd';
import { RocketOutlined, MailOutlined, PhoneOutlined, BuildOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import { assetHost } from '../stores/APIEndpoints';
import ProgramStore from '../stores/ProgramStore';

import ProgramDescription from './EditableProgramDescription';
import ActivationModal from './ActivationModal';
import Milestones from './Milestones';

const { Title, Paragraph } = Typography;

@inject("appStore")
@observer
class EditableProgramDetailUI extends Component {

    constructor(props) {
        super(props);
        this.store = new ProgramStore({ apiProxy: props.appStore.apiProxy })
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

    /**
     * Let the coach to upload the Poster image. 
     * @param {*} program 
    */
    getContentButton = (program) => {
        if (!this.store.canEdit) {
            return;
        }

        const action = `${assetHost}/programs/${program.id}/poster`
        const props = {
            name: 'poster.png',
            action: action,
            accept: ".png",
            showUploadList: false
        };

        return (
            <Upload key="poster_uplod" {...props} onChange={this.onContentChange}>
                <Tooltip key="poster_tp" title="To Upload or Change the Poster of this Program.">
                    <Button key="poster_button" type="primary" icon={<BuildOutlined />}>Poster</Button>
                </Tooltip>
            </Upload>
        )
    }

    onActivate = () => {
        this.store.showActivationModal = true;
    }

    onContentChange = (info) => {
        this.store.change = new Date().getTime();
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
        const ver = new Date().getTime();
        const url = `${assetHost}/programs/${program.id}/poster/poster.png?nocache=${ver}`;
        return (
            <div style={{ textAlign: "center", height: 450 }}>
                <div style={{ display: "inline-block", verticalAlign: "middle", height: 450 }}></div>
                <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block", borderRadius:"12px"}} src={url} />
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
                        this.getActivationButton(),
                        this.getContentButton(program)
                    ]}>

                    {this.getProgramPoster(program, change)}

                    <Card title={<Title level={4}>Coach</Title>} extra={<a href="#">More</a>}>
                        <Statistic value={coach.name} valueStyle={{ color: '#3f8600' }} />
                        <Paragraph><MailOutlined /> {coach.email}</Paragraph>
                        <Paragraph><PhoneOutlined /> (91)99999 99999</Paragraph>
                    </Card>

                    <ProgramDescription program={program} programStore={this.store} />

                    <Milestones program={program} programStore={this.store} apiProxy={this.props.appStore.apiProxy}/>

                    <Card title={<Title level={4}>Trailers</Title>} extra={<a href="#">Edit</a>}>
                        <Card
                            style={{ border: '1px solid lightgray' }}
                            cover={<img alt="cover" style={{ border: "1px solid lightgray" }} src={this.getTrailerUrl()} />}>
                        </Card>
                    </Card>

                </PageHeader>
                <ActivationModal programStore={this.store} />
            </>
        )
    }
}
export default EditableProgramDetailUI;
