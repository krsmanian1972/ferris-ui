import React from 'react';
import {Menu} from 'antd';
import { inject, observer } from 'mobx-react';
import {LogoutOutlined} from '@ant-design/icons';

@inject("appStore")
@observer
class AccountMenu extends React.Component {

  render() {
    const appStore = this.props.appStore;
    return (
      <Menu>
        <Menu.Item onClick={this.handleClose}>Profile</Menu.Item>
        <Menu.Item onClick={this.handleClose}>My account</Menu.Item>
        <Menu.Divider />
        <Menu.Item onClick={appStore.logout}>
          <LogoutOutlined />
          Logout
        </Menu.Item>
      </Menu>
    );
  }
}

export default AccountMenu;