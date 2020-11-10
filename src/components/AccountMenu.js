import React from 'react';
import { Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import { LogoutOutlined, ProfileOutlined } from '@ant-design/icons';

import { headerMenuStyle } from './util/Style';

@inject("appStore")
@observer
class AccountMenu extends React.Component {

  showProfileUI = () => {

    const id = this.props.appStore.apiProxy.getUserFuzzyId();

    const params = { userId: id, parentKey: "Home" };

    this.props.appStore.currentComponent = { label: "Profile", key: "profile", params: params };
  }

  render() {
    const appStore = this.props.appStore;
    return (
      <Menu style={headerMenuStyle}>
        <Menu.Item key="prof" onClick={this.showProfileUI} icon={<ProfileOutlined />}>
          Your Profile
        </Menu.Item>
        <Menu.Item key="logout" onClick={appStore.logout} icon={<LogoutOutlined />}>
          Logout from Ferris
        </Menu.Item>
      </Menu>
    );
  }
}

export default AccountMenu;