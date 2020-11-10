import React from 'react';

import { Tooltip, Typography, Card, Button, Statistic } from 'antd';
import { MailOutlined, ProfileOutlined } from '@ant-design/icons';
import { assetHost } from '../stores/APIEndpoints';

import { cardHeaderStyle } from '../util/Style';

const { Title, Paragraph } = Typography;

export default function AboutCoach({ coach, appStore }) {

    const profileButton = () => {
        return (
            <Tooltip key="profile_tip" title="To edit the profile of the Coach">
                <Button key="profile_button" onClick={showProfileUI} type="primary" icon={<ProfileOutlined />}>Profile</Button>
            </Tooltip>
        );
    }

    const showProfileUI = () => {
        const params = { userId: coach.id, parentKey: "programDetailUI" };
        appStore.currentComponent = { label: "Profile", key: "profile", params: params };
    }

    const getCoachCoverUrl = () => {
        const ver = new Date().getTime();
        const url = `${assetHost}/users/${coach.id}/cover.png?nocache=${ver}`;
        return url;
    }

    return (
        <Card
            headStyle={cardHeaderStyle}
            style={{ borderRadius: "12px", marginTop: "10px" }}
            title={<Title level={4}>Coach</Title>}
            extra={profileButton()}>

            <div key="user_image" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ width: "30%", height: 100 }}>
                    <div style={{ display: "inline-block", verticalAlign: "middle", height: 100 }}></div>
                    <img style={{ maxHeight: "100%", maxWidth: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px" }} src={getCoachCoverUrl()} />
                </div>
                <div style={{ width: "70%", textAlign: "left", height: 100, marginLeft: 15 }}>
                    <Statistic value={coach.name} valueStyle={{ color: "rgb(0, 183, 235)", fontWeight: "bold" }} />
                    <Paragraph style={{ marginTop: 10 }}><MailOutlined /> {coach.email}</Paragraph>
                </div>
            </div>
        </Card>
    )



}