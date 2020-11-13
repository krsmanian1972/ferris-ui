import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Dropdown, Menu, Layout, Typography, Row, Col, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import ownerLogo from '../images/krscode.png';

import AccountMenu from './AccountMenu';
import MessageButton from './MessageButton';

const { Text } = Typography;
const { Header } = Layout;

const caption = "KRS Code";

@inject("appStore")
@observer
export default class ToolBar extends Component {

    handleEvent = (e) => {
        const appStore = this.props.appStore;
        appStore.navigateTo(e.key);
    }

    renderRoleTabs = () => {
        const appStore = this.props.appStore;
        if (!appStore.isLoggedIn()) {
            return (
                <Col span={20} style={{ textAlign: "right" }}>
                    <Text strong={true}>Ferris - The Coaching Assistant</Text>
                </Col>
            )
        }

        return (
            <Col span={14}>
                <Menu mode="horizontal" defaultSelectedKeys={['0']} style={{ borderStyle: "none" }}>
                    {
                        appStore.menus.map((item, index) => (
                            <Menu.Item key={index} onClick={this.handleEvent} >{item.label}</Menu.Item>)
                        )
                    }
                </Menu>
            </Col>
        )
    }

    renderRightMenu = () => {
        const appStore = this.props.appStore;
        if (appStore.isLoggedIn()) {
            return (
                <Col span={6} style={{ textAlign: "right" }}>
                    <Space>
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
                    <Col style={{ paddingTop: 5 }} span={4}>
                        <img src={ownerLogo} align="left" width="26" height="52" title={caption} />
                    </Col>
                    {this.renderRoleTabs()}
                    {this.renderRightMenu()}
                </Row>
            </Header>
        )
    }
}