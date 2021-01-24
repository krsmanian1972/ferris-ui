import React from 'react';

import { Typography, Card, Statistic, } from 'antd';
import { MailOutlined} from '@ant-design/icons';
import { cardHeaderStyle } from '../util/Style';

const { Title, Paragraph } = Typography;

function SessionPeers({people}) {

    const coach = people.coach;
    const member = people.member;

    return (
        <Card key="people"
            headStyle={cardHeaderStyle}
            style={{ borderRadius: 12, marginTop: 10 }}
            title={<Title level={4}>People</Title>}>
            <div style={{ display: "flex", marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
                <div key="coachId" style={{ width: "50%" }}>
                    <Statistic title="Coach" value={coach.user.name} valueStyle={{ color: "rgb(0, 183, 235)", fontWeight: "bold" }} />
                    <Paragraph><MailOutlined /> {coach.user.email}</Paragraph>
                </div>

                <div key="actorId" style={{ width: "50%", borderLeft: "1px solid lightgray", paddingLeft: 20 }}>
                    <Statistic title="Actor" value={member.user.name} />
                    <Paragraph><MailOutlined /> {member.user.email}</Paragraph>
                </div>
            </div>
        </Card>
    )
}

export default SessionPeers;