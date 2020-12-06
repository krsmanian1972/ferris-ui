import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tooltip, Card, Switch, Typography, PageHeader, Statistic, Spin, Result, Upload, Button, Tag } from 'antd';
import { UploadOutlined, MailOutlined } from '@ant-design/icons';

import Editor from "./Editor";

import ProfileStore from '../stores/ProfileStore';

import { assetHost } from '../stores/APIEndpoints';
import { cardHeaderStyle, pageHeaderStyle, pageTitle } from '../util/Style';

import { baseUrl } from '../stores/APIEndpoints';

const { Paragraph, Title } = Typography;

const contentStyle = { background: "white", width: "100%", borderRadius: 12, marginBottom: 10, height: 230, padding: 25 };

const FEATURE_KEY = "profile";

@inject("appStore")
@observer
export default class ProfileUI extends Component {

    constructor(props) {
        super(props);

        this.apiProxy = props.appStore.apiProxy;
        this.userId = props.params.userId;

        this.store = new ProfileStore({ apiProxy: props.appStore.apiProxy });

        this.canEdit = this.apiProxy.getUserFuzzyId() === this.userId

        this.state = {
            aboutEditMode: false,
            experienceEditMode: false,
        }
    }

    componentDidMount() {
        this.store.fetchUserDetails(this.userId);
    }

    getEditAboutButton = () => {

        if (!this.canEdit) {
            return;
        }

        return (
            <Tooltip key="about_tip" title="To describe about you.">
                <Switch key="about_switch" onClick={this.onEditAbout} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );

    }

    getEditExperienceButton = () => {

        if (!this.canEdit) {
            return;
        }

        return (
            <Tooltip key="exp_tip" title="To elaborate your experience">
                <Switch key="exp_switch" onClick={this.onEditExperience} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );
    }

    onEditAbout = (mode) => {
        this.setState({ aboutEditMode: mode });

        if (mode) {
            return;
        }

        this.store.saveAbout();
    }

    onEditExperience = (mode) => {
        this.setState({ experienceEditMode: mode });

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

        if (this.state.aboutEditMode) {
            return <Editor id="user_about" value={about} onChange={this.handleAboutText} height={300} />
        }

        return (
            <Editor id="user_about" value={about} readOnly={true} height={300} />
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

        if (this.state.experienceEditMode) {
            return <Editor id="user_exp" value={experience} onChange={this.handleExperienceText} height={300} />
        }

        return (
            <Editor id="user_exp" value={experience} readOnly={true} height={300} />
        )
    }

    /**
     * Cheat the renderer to show the latest image
     */
    onCoverImageChange = () => {
        this.store.change = new Date().getTime();
    }

    /**
    * Let the User to upload her/his Thumbnail/Cover image
    * 
    */
    uploadCover = (user) => {

        if (!this.canEdit) {
            return <></>
        }

        const action = `${assetHost}/users/${user.id}`
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

    getPageLink = (userId) => {
        const url = `${baseUrl}?featureKey=${FEATURE_KEY}&fuzzyId=${userId}`;
        return url;
    }

    getCoverUrl = (user) => {
        const ver = new Date().getTime();
        const url = `${assetHost}/users/${user.id}/cover.png?nocache=${ver}`;
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

        const user = this.store.user;

        return (
            <div key="user_image" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ width: "30%", height: 180 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 180 }}></div>
                    <img style={{ maxHeight: "100%", maxWidth: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={this.getCoverUrl(user)} />
                </div>

                <div style={{ width: "70%", textAlign: "left", height: 180, marginLeft: 15 }}>
                    <Statistic value={user.name} valueStyle={{ color: "rgb(0, 183, 235)", fontWeight: "bold" }} />
                    <Tooltip key="user_link" title="Share this link to access your profile">
                        <Tag style={{ marginTop: 5, marginBottom: 5, color: "blue", fontSize: "smaller" }}>{this.getPageLink(user.id)}</Tag>
                    </Tooltip>
                    <Paragraph></Paragraph>
                    {this.uploadCover(user)}
                </div>
            </div>
        )
    }

    getTitle = () => {

        var title = "Your Profile";

        if(this.store.user && this.store.user.userType === "coach") {
            title = "The Coach";
        } 

        return title;
    }

    render() {

        const change = this.store.change;
        
        const title = this.getTitle();

        return (
            <PageHeader style={pageHeaderStyle} title={pageTitle(title)}>

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
