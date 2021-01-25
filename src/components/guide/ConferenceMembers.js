import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Typography, Card, List, Statistic, Avatar, Spin, Button, Tooltip, Popconfirm, Tag } from 'antd';
import { DeleteOutlined, MailOutlined, UserOutlined, PlusCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { cardHeaderStyle } from '../util/Style';
import ConferenceInvitationDrawer from './ConferenceInvitationDrawer';

const { Title, Paragraph } = Typography;

@observer
class ConferenceMembers extends Component {

    constructor(props) {
        super(props);
        this.store = props.sessionStore;
    }

    componentDidMount() {
        const { program } = this.store.event;
        this.store.enrollmentListStore.fetchEnrollments(program.id, 'ALL');
    }

    renderCoach = () => {

        const coachTuple = this.store.people.coach;

        return (
            <div key="coachId" style={{ width: "100%" }}>
                <Statistic title="Coach" value={coachTuple.user.name} valueStyle={{ color: "rgb(0, 183, 235)", fontWeight: "bold" }} />
                <Paragraph><MailOutlined /> {coachTuple.user.email}</Paragraph>
            </div>
        )
    }


    addMemberButton = () => {
        return (
            <Tooltip key="add_member_tip" title="To invite a registered member to this session.">
                <Button key="add" onClick={this.onNewMember} type="primary" icon={<PlusCircleOutlined />}>Add Member</Button>
            </Tooltip>
        )
    }

    removeMemberButton = (userId) => {
        return (
            <Popconfirm key="ready_pop" placement="left" title="Are you sure to remove this member?" okText="Yes" cancelText="No"
                onConfirm={() => this.onRemoveMember(userId)}
            >
                <Button key="remove" danger icon={<DeleteOutlined />} shape="circle" style={{ margin: 10 }}></Button>
            </Popconfirm>
        )
    }

    onNewMember = () => {
        this.store.showInvitationDrawer = true;
    }

    onRemoveMember = (userId) => {
        this.store.removeConferenceMember(userId);
    }

    renderMembers = () => {
        const members = this.store.people.members;
        return (
            <List
                dataSource={members}
                renderItem={tuple => (
                    <List.Item key={tuple.user.id} style={{ background: "rgb(242,242,242)", color: 'black', marginBottom: 10 }}>
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#87d068', margin: 10 }} icon={<UserOutlined />} />}
                            title={tuple.user.name}
                            description={tuple.user.email} />

                        {this.removeMemberButton(tuple.user.id)}
                    </List.Item>
                )}
            >
                {this.store.isLoading && (
                    <div><Spin /></div>
                )}
            </List>
        )
    }

    countTag = () => {

        if (this.store.isDone) {
            const membersCount = this.store.people.members.length;
            return <Tag color="#108ee9" icon={<TeamOutlined />}>{membersCount}</Tag>
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }

        if (this.store.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    render() {

        const change = this.store.change;

        return (
            <>
                <Card key="Organizer"
                    headStyle={cardHeaderStyle}
                    style={{ borderRadius: 12, marginTop: 10 }}
                    title={<Title level={4}>Organizer</Title>}>
                    {this.renderCoach()}
                </Card>

                <Card key="Members"
                    headStyle={cardHeaderStyle}
                    style={{ borderRadius: 12, marginTop: 10 }}
                    title={<Title level={4}>Members {this.countTag()}</Title>}
                    extra={this.addMemberButton()}
                >
                    {this.renderMembers()}
                </Card>

                <ConferenceInvitationDrawer sessionStore={this.store} />
            </>
        )
    }
}

export default ConferenceMembers