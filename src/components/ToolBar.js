import React, { Component } from 'react';
import { inject,observer } from 'mobx-react';
import AccountMenu from './AccountMenu';
import { Dropdown, Space } from 'antd';
import {AlertOutlined,UserOutlined} from '@ant-design/icons';

@inject("appStore")
@observer
export default class ToolBar extends Component {
    renderMenu() {
        const appStore = this.props.appStore;
        if (!appStore.isLoggedIn()) return null;
        
        return (
            <Space>
                <AlertOutlined />
                <Dropdown.Button overlay={<AccountMenu />} trigger={['click']} icon={<UserOutlined />}>
                        {appStore.credentials.username}
                </Dropdown.Button>
            </Space>
        )
    }

    render() {
        const appStore = this.props.appStore;

        return (
            <div style={{ float: 'right' }} >
                {this.renderMenu()}
            </div>
        )
    }
}