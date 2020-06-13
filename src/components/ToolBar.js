import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AccountMenu from './AccountMenu';
import { Dropdown, Menu, Layout, Input, Space, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import ownerLogo from '../images/pm-power.png';

const { Search } = Input;
const { Header } = Layout;

const caption = "PM Power Consulting";

@inject("appStore")
@observer
export default class ToolBar extends Component {

    handleEvent = (e) => {
        const appStore = this.props.appStore;
        appStore.navigateTo(e.key);
    }

    renderRoleTabs = () => {
        const appStore = this.props.appStore;
        return (
            <Menu theme="light" mode="horizontal" defaultSelectedKeys={['0']} >
                {
                    appStore.menus.map((item, index) => (
                        <Menu.Item key={index} onClick={this.handleEvent} >{item.label}</Menu.Item>)
                    )
                }
            </Menu>
        )
    }

    renderRightMenu() {
        const appStore = this.props.appStore;
        if (!appStore.isLoggedIn()) return null;

        return (
            <Dropdown.Button overlay={<AccountMenu />} trigger={['click']} icon={<UserOutlined />}>
                {appStore.credentials.username}
            </Dropdown.Button>
        )
    }

    render() {
        return (
            <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: '#fff', padding: "0px 5px 0px 5px" }}>
                <Row>
                    <Col span={6}>
                        <img src={ownerLogo} align="left" width="100" height="62" title={caption} />
                    </Col>
                    <Col span={12}>
                        {this.renderRoleTabs()}
                    </Col>
                    <Col span={6}>
                        {this.renderRightMenu()}
                    </Col>
                </Row>
            </Header>
        )
    }
}