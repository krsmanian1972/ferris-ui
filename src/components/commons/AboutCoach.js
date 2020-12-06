import React from 'react';

import { Tooltip, Button, Typography, Space } from 'antd';
import { PlusCircleOutlined, ProfileFilled } from '@ant-design/icons';
import Avatar from 'antd/lib/avatar/avatar';

import { assetHost, baseUrl } from '../stores/APIEndpoints';
import { rustColor } from '../util/Style'

const { Title } = Typography;

const FEATURE_KEY = "profile";
const contentStyle = { display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 40, paddingLeft: 15, alignItems: "center", borderLeft: "3px solid green" };

export default function AboutCoach({ coach, program, canEnroll, onEnroll, isYou }) {

    const getEnrollmentButton = () => {
        if (canEnroll) {
            return (
                <div style={{ width: "20%", textAlign: "right" }}>
                    <Tooltip key="new_enrollment_tip" title={`Enroll in this program offered by ${coach.name}`}>
                        <Button key="enroll" onClick={() => onEnroll(coach, program)} type="primary" icon={<PlusCircleOutlined />}>Enroll</Button>
                    </Tooltip>
                </div>
            );
        }
    }

    const getSelfIndicator = () => {
        if (isYou) {
            return (
                <div style={{ width: "20%", textAlign: "right", ...rustColor }}>You</div>
            )
        }
        return <>&nbsp;</>
    }

    const openProfileWindow = () => {
        const title = `Profile of ${coach.name}`
        const url = `${baseUrl}?featureKey=${FEATURE_KEY}&fuzzyId=${coach.id}`;
        window.open(url, "_blank");
    }

    const getCoachCoverUrl = () => {
        const ver = new Date().getTime();
        const url = `${assetHost}/users/${coach.id}/cover.png?nocache=${ver}`;
        return url;
    }

    return (
        <div key="coach_div" style={contentStyle}>
            <Space>
                <Avatar size="large" style={{ cursor: "pointer", marginRight: 20 }} src={getCoachCoverUrl()} onClick={openProfileWindow} />
                <Title level={3} style={{color: "rgb(0, 183, 235)", fontWeight: "bold" , cursor: "pointer",margin:0 }} onClick={openProfileWindow}>{coach.name}</Title>
            </Space>
            {getSelfIndicator()}
            <Button type="link" style={{...rustColor}} onClick={openProfileWindow} icon={<ProfileFilled/>}>View Profile</Button>
            {getEnrollmentButton()}
        </div>
    )
}