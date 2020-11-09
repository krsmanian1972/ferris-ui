import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tooltip, Card, Switch, Typography, PageHeader, Statistic, Spin, Result, Upload, Button, Tag } from 'antd';
import { UploadOutlined, MailOutlined, LinkOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

import CoachStore from '../stores/CoachStore';

import { assetHost } from '../stores/APIEndpoints';
import { cardHeaderStyle, pageHeaderStyle, pageTitle } from '../util/Style';

import { baseUrl } from '../stores/APIEndpoints';

const { Paragraph, Title } = Typography;

const contentStyle = { background: "white", width: "100%", borderRadius: 12, marginTop: 10, marginBottom: 10, height: 200, padding: 10 };

const FEATURE_KEY = "coach";

@inject("appStore")
@observer
export default class CoachUI extends Component {

    constructor(props) {
        super(props);

        this.apiProxy = props.appStore.apiProxy;
        this.coachId = props.params.coachId;

        this.store = new CoachStore({ apiProxy: props.appStore.apiProxy });

        this.isCoach = this.apiProxy.getUserFuzzyId() === this.coachId

        this.state = {
            editMode: false,
        }
    }

    componentDidMount() {
        this.store.fetchCoachDetails(this.coachId);
    }

    getEditAboutButton = () => {

        if (!this.isCoach) {
            return;
        }

        return (
            <Tooltip key="about_coach_desc" title="To describe about you.">
                <Switch key="about_coach_switch" onClick={this.onEditAbout} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );

    }

    getEditExperienceButton = () => {

        if (!this.isCoach) {
            return;
        }

        return (
            <Tooltip key="about_coach_hist" title="To elaborate your experience">
                <Switch key="about_coach_hist" onClick={this.onEditExperience} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );
    }

    onEditAbout = (mode) => {
        this.setState({ editMode: mode });

        if (mode) {
            return;
        }

        this.store.saveAbout();
    }

    onEditExperience = (mode) => {
        this.setState({ editMode: mode });

        if (mode) {
            return;
        }

        this.store.saveExperience();
    }

    handleAboutText = (text) => {
        this.store.about = text;
    }

    handleExperienceText = (text) => {
        this.store.experience = text;
    }

    renderAbout = () => {

        if (this.store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.store.isError) {
            return (
                <Result status="warning" title="Unauthorized" subTitle={this.store.message.help} />
            )
        }

        const about = this.store.about;

        if (this.state.editMode) {
            return <Editor id="coach_about" value={about} onChange={this.handleAboutText} height={300} />
        }

        return (
            <Editor id="coach_about" value={about} readOnly={true} height={300} />
        )
    }

    renderExperience = () => {

        if (this.store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.store.isError) {
            return (
                <Result status="warning" title="Unauthorized" subTitle={this.store.message.help} />
            )
        }

        const experience = this.store.experience;

        if (this.state.editMode) {
            return <Editor id="coach_exp" value={experience} onChange={this.handleExperienceText} height={300} />
        }

        return (
            <Editor id="coach_exp" value={experience} readOnly={true} height={300} />
        )
    }

    /**
     * Cheat the renderer to show the latest image
     */
    onCoverImageChange = () => {
        this.store.change = new Date().getTime();
    }

    /**
    * Let the coach to upload her/his Thumbnail/Cover image
    * 
    */
    uploadCover = (coach) => {

        if (!this.isCoach) {
            return <></>
        }

        const action = `${assetHost}/mentors/${coach.id}`
        const props = {
            name: 'cover.png',
            action: action,
            accept: ".png",
            showUploadList: false
        };

        return (
            <Upload {...props} onChange={this.onCoverImageChange}>
                <Tooltip title="To Upload or Change the Thumbnail Image of you.">
                    <Button icon={<UploadOutlined />}></Button>
                </Tooltip>
            </Upload>
        )
    }

    getPageLink = (coachId) => {
        const url = `${baseUrl}?featureKey=${FEATURE_KEY}&fuzzyId=${coachId}`;
        return url;
    }

    getCoverUrl = (coach) => {
        const ver = new Date().getTime();
        const url = `${assetHost}/mentors/${coach.id}/cover.png?nocache=${ver}`;
        return url;
    }

    renderHeader = () => {

        if (this.store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.store.isError) {
            return (
                <Result status="error" subTitle={this.store.message.help} />
            )
        }

        const coach = this.store.coach;

        return (
            <div key="coach_image" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ width: "30%", height: 180 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 180 }}></div>
                    <img style={{ maxHeight: "100%", maxWidth: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={this.getCoverUrl(coach)} />
                </div>

                <div style={{ width: "70%", textAlign: "left", height: 180, marginRight: 10 }}>
                    <Statistic value={coach.name} valueStyle={{ color: "rgb(0, 183, 235)", fontWeight: "bold" }} />
                    <Paragraph style={{ marginTop: 10 }}><MailOutlined /> {coach.email} </Paragraph>
                    <Tooltip key="coach_link" title="Share this link to access your profile">
                        <Tag style={{ marginTop: 5, marginBottom: 5, color: "blue", fontSize: "smaller" }}>{this.getPageLink(coach.id)}</Tag>
                    </Tooltip>
                    <Paragraph></Paragraph>
                    {this.uploadCover(coach)}
                </div>
            </div>
        )
    }

    render() {

        const change = this.store.change;

        return (
            <PageHeader
                style={pageHeaderStyle}
                title={pageTitle("The Coach")}
            >

                <div style={contentStyle}>
                    {this.renderHeader()}
                </div>

                <Card
                    headStyle={cardHeaderStyle}
                    style={{ borderRadius: "12px", marginTop: "10px" }}
                    title={<Title level={4}>About</Title>} extra={this.getEditAboutButton()}>
                    {this.renderAbout()}
                </Card>

                <Card
                    headStyle={cardHeaderStyle}
                    style={{ borderRadius: "12px", marginTop: "10px" }}
                    title={<Title level={4}>Experience</Title>} extra={this.getEditExperienceButton()}>
                    {this.renderExperience()}
                </Card>

            </PageHeader>
        );

    }
}
