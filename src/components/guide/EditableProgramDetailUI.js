import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, PageHeader, Tooltip, Card, Button, Statistic, Upload, message } from 'antd';
import { RocketOutlined, MailOutlined, PhoneOutlined, BuildOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import { assetHost } from '../stores/APIEndpoints';
import ProgramStore from '../stores/ProgramStore';

import ProgramDescription from './EditableProgramDescription';
import ActivationModal from './ActivationModal';
import Milestones from './Milestones';
import AboutMentor from './AboutMentor';
import EnrollmentList from './EnrollmentList';
import Trailer from './Trailer';

import { cardHeaderStyle, pageHeaderStyle,pageTitle } from '../util/Style';

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
    getPosterButton = (program) => {
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
            <Upload key="poster_upload" {...props} onChange={this.onContentUpload}>
                <Tooltip key="poster_tp" title="To Upload or Change the Poster of this Program.">
                    <Button key="poster_button" type="primary" icon={<BuildOutlined />}>Poster</Button>
                </Tooltip>
            </Upload>
        )
    }

    /**
    * Let the coach to upload the Banner image. 
    * @param {*} program 
   */
    getBannerButton = (program) => {
        if (!this.store.canEdit) {
            return;
        }

        const action = `${assetHost}/programs/${program.id}/banner`
        const props = {
            name: 'banner.png',
            action: action,
            accept: ".png",
            showUploadList: false
        };

        return (
            <Upload key="banner_upload" {...props} onChange={this.onContentUpload}>
                <Tooltip key="banner_tp" title="To Upload or Change the Banner of this Program.">
                    <Button key="banner_button" type="primary" icon={<BuildOutlined />}>Banner</Button>
                </Tooltip>
            </Upload>
        )
    }

    onActivate = () => {
        this.store.showActivationModal = true;
    }

    onContentUpload = (info) => {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            this.store.change = new Date().getTime();
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
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
            <Card>
                <div style={{ textAlign: "center", height: 350 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 350 }}></div>
                    <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={url} />
                </div>
            </Card>
        )
    }

    /**
     * We do not want banner for Private Programs
     * 
     * 
     * @param {*} program 
     * @param {*} change 
     */
    getBanner = (program, change) => {

        if(program.isPrivate === true) {
            return (<></>)
        }

        const ver = new Date().getTime();
        const url = `${assetHost}/programs/${program.id}/banner/banner.png?nocache=${ver}`;
        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px", marginTop: "10px" }}
                title={<Title level={4}>Banner</Title>}
                extra={this.getBannerButton(program)}>
                <div style={{ textAlign: "center", height: 260 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 260 }}></div>
                    <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={url} />
                </div>
            </Card>
        )
    }

    renderProgramModel = () => {

        const { program, coach } = this.store.programModel;
        const change = this.store.change;

        return (
            <>
                <PageHeader
                    style={pageHeaderStyle}
                    title={pageTitle(program.name)}
                    extra={[
                        this.getActivationButton(),
                        this.getPosterButton(program)
                    ]}>


                    {this.getProgramPoster(program, change)}

                    <Trailer program_id={program.id} canEdit={this.store.canEdit} />

                    <ProgramDescription program={program} programStore={this.store} />

                    <Card
                        headStyle={cardHeaderStyle}
                        style={{ borderRadius: "12px", marginTop: "10px" }}
                        title={<Title level={4}>Coach</Title>}>
                        <Statistic value={coach.name} valueStyle={{ color: "rgb(0, 183, 235)", fontWeight: "bold" }} />
                        <Paragraph style={{ marginTop: 10 }}><MailOutlined /> {coach.email}</Paragraph>
                        <Paragraph ><PhoneOutlined /> (91)99999 99999</Paragraph>
                    </Card>

                    <AboutMentor program={program} programStore={this.store} apiProxy={this.props.appStore.apiProxy}/>

                    <Milestones program={program} programStore={this.store} apiProxy={this.props.appStore.apiProxy} />

                    {this.getBanner(program, change)}

                    <EnrollmentList programId={program.id} programName={program.name} />

                </PageHeader>

                <ActivationModal programStore={this.store} />
            </>
        )
    }
}
export default EditableProgramDetailUI;
