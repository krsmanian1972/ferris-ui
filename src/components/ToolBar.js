import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AccountMenu from './AccountMenu';
import { Dropdown, Menu,  Input, Typography,Space } from 'antd';
import { Row, Col } from 'antd';
import { AlertOutlined, UserOutlined } from '@ant-design/icons';
import ownerLogo from '../images/pm-power.png';

const { Search } = Input;

const ownerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

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
            <Space>
                <Search placeholder="search" onSearch={value => console.log(value)} style={{ width: 200 }} />
                <AlertOutlined />    
                <Dropdown.Button overlay={<AccountMenu />} trigger={['click']} icon={<UserOutlined />}>
                        {appStore.credentials.username}
                </Dropdown.Button>
            </Space>    
        )
    }

    render() {
        return (
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row" span={8}>
                    {this.renderRoleTabs()}
                </Col>
                <Col className="gutter-row" span={8}>
                    <div className="owner-logo">
                        <img src={ownerLogo} width="100" height="62" />
                    </div> 
                </Col>
            </Row>
        )
    }
}