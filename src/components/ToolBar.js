import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Dropdown, Menu, Layout, Typography, Row, Col, Space,Tooltip,Button } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';

import ownerLogo from '../images/krscode.png';

import AccountMenu from './AccountMenu';
import MessageButton from './MessageButton';

const { Text } = Typography;
const { Header } = Layout;

const caption = "KRS Code";

@inject("appStore")
@observer
class ToolBar extends Component {

    handleEvent = (e) => {
        const appStore = this.props.appStore;
        appStore.navigateTo(e.key);
    }

    renderRoleTabs = () => {
        const appStore = this.props.appStore;
        if (!appStore.isLoggedIn()) {
            return (
                <Col span={22} style={{ textAlign: "right" }}>
                    <Text strong={true}>Ferris - The Coaching Assistant</Text>
                </Col>
            )
        }

        return (
            <Col span={13}>
                <Menu mode="horizontal" defaultSelectedKeys={['0']}>
                    {
                        appStore.menus.map((item, index) => (
                            <Menu.Item key={index} className="customclass" onClick={this.handleEvent} >{item.label}</Menu.Item>)
                        )
                    }
                </Menu>
            </Col>
        )
    }

    showEnrollments = () => {
        const params = { event: {}, parentKey: "home" };
        this.props.appStore.currentComponent = { label: "Enrollments", key: "enrollments", params: params };
    }

    membersButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="members_tip" title="Enrolled Members">
                    <Button type="primary" icon={<TeamOutlined />} onClick={this.showEnrollments}>Team</Button>
                </Tooltip>
            )
        }
    }

    renderRightMenu = () => {
        const appStore = this.props.appStore;
        if (appStore.isLoggedIn()) {
            return (
                <Col span={6} style={{ textAlign: "right" }}>
                    <Space>
                        {this.membersButton()}
                        <MessageButton appStore = {appStore}/>
                        <Dropdown.Button overlay={<AccountMenu />} trigger={['click']} icon={<UserOutlined />}>
                            {appStore.credentials.username}
                        </Dropdown.Button>
                    </Space>
                </Col>
            )
        }
    }

    render() {
        return (
            <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: '#fff', padding: "0px 5px 0px 5px" }}>
                <Row>
                    <Col style={{ paddingTop: 5 }} span={2}>
                        <img alt="krscode" src={ownerLogo} align="left" width="26" height="52" title={caption} />
                    </Col>
                    {this.renderRoleTabs()}
                    {this.renderRightMenu()}
                </Row>
            </Header>
        )
    }
}

export default ToolBar;