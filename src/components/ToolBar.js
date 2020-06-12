import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AccountMenu from './AccountMenu';
import { Dropdown, Menu, Layout, Input, Space } from 'antd';
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
            <Space align="start">
                <Search placeholder="search" onSearch={value => console.log(value)} style={{ width: 200 }} />
                <Dropdown.Button overlay={<AccountMenu />} trigger={['click']} icon={<UserOutlined />}>
                    {appStore.credentials.username}
                </Dropdown.Button>
            </Space>
        )
    }

    render() {
        return (
            <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: '#fff' }}>
                    <div className="nav-left">
                        <img src={ownerLogo} width="100" height="62" title={caption} />
                    </div>
                    <div className="nav-right">
                        <Space align="start">
                            {this.renderRoleTabs()}
                            {this.renderRightMenu()}
                        </Space>
                    </div>
                
            </Header>
        )
    }
}