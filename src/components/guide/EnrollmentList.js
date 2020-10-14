import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, List, Card, Button,Typography, Radio, Tooltip, Tag, Avatar, Space } from 'antd';
import { UserOutlined,PlusCircleOutlined } from '@ant-design/icons';

import EnrollmentListStore from "../stores/EnrollmentListStore";
import EnrollmentStore from '../stores/EnrollmentStore';

import InvitationDrawer from './InvitationDrawer';

import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;

const NEW = "NEW";
const ALL = "ALL";

@inject("appStore")
@observer
class EnrollmentList extends Component {

    constructor(props) {
        super(props);
        this.state = { desire: NEW };

        this.listStore = new EnrollmentListStore({ apiProxy: props.appStore.apiProxy });
        this.listStore.fetchEnrollments(props.programId, this.state.desire);

        this.store = new EnrollmentStore({ apiProxy: props.appStore.apiProxy });
    }

    onChange = (e) => {
        const desire = e.target.value;
        this.setState({ desire: desire });

        this.listStore.fetchEnrollments(this.props.programId, desire);
    }

    onEnroll = () => {
        this.store.showInvitationDrawer = true;
        this.store.state = "done";
    }

    getEnrollmentOptions = () => {
        return (
            <Space>
                <Tooltip key="enrol_list_tip" title="Shows the list of Enrollments.">
                    <Radio.Group onChange={this.onChange} value={this.state.desire}>
                        <Radio value={NEW}>NEW</Radio>
                        <Radio value={ALL}>ALL</Radio>
                    </Radio.Group>
                </Tooltip>
                <Tooltip key="enrol_tip" title="You can enroll new members into this program.">
                    <Button key="add" onClick={this.onEnroll} type="primary" icon={<PlusCircleOutlined />}>Add Member</Button>
                </Tooltip>
            </Space>
        );
    }

    countTag = () => {

        if (this.listStore.isDone) {
            return <Tag color="#108ee9">{this.listStore.rowCount} Total</Tag>
        }

        if (this.listStore.isError) {
            return <Tag color="red">...</Tag>
        }

        if (this.listStore.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    render() {
        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px", marginTop: "10px" }}
                title={<Title level={4}>Enrollments {this.countTag()}</Title>} extra={this.getEnrollmentOptions()}>
                <List
                    dataSource={this.listStore.members}
                    renderItem={item => (
                        <List.Item key={item.id} style={{ background: "rgb(242,242,242)", color: 'black', marginBottom: 10 }}>
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: '#87d068', margin: 10 }} icon={<UserOutlined />} />}
                                title={item.name}
                                description={item.email} />
                        </List.Item>
                    )}
                >
                    {this.listStore.isLoading && (
                        <div>
                            <Spin />
                        </div>
                    )}
                </List>

                <InvitationDrawer programId={this.props.programId} programName={this.props.programName} store={this.store} listStore={this.listStore}/>
            </Card>
        )
    }

}

export default EnrollmentList;