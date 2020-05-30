import React from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Menu, Icon, Typography } from 'antd';

import KrustLogo from './KrustLogo';

const { Title } = Typography;

const { Sider } = Layout;
const { Item, ItemGroup } = Menu;

const drawerWidth = 250;

const titleStyle = {
  fontSize: 16,
  color: 'white',
  marginTop: '10%'
};

@inject("appStore")
@observer
class NavigationBar extends React.Component {
  state = {
    open: true,
  };


  handleDrawerVisibility = open => {
    this.setState({ open })
  }

  renderRoleTabs() {
    const appStore = this.props.appStore;
    return (
      <Menu mode='horizontal'>
        <ItemGroup key="Ferris" title={<Title style={titleStyle}>Ferris</Title>}>
          {appStore.menus.map((menu, index) => (
            <Item key={index} onClick={() => { appStore.transitionTo(menu.key); this.setState({ open: false }) }}>
              <Icon type={menu.icon} theme={menu.theme} />
              <span>{menu.label}</span>
            </Item>
          ))}
        </ItemGroup>
      </Menu>
    )
  }


  render() {
    const { open } = this.state;

    const appStore = this.props.appStore;
    if (!appStore.isLoggedIn()) {
      return null;
    }

    return (
      <Sider
        width={drawerWidth}
        collapsible
        collapsed={open}
        onCollapse={this.handleDrawerVisibility}
      >
        <center>
          <KrustLogo small={open} />
        </center>
        {this.renderRoleTabs()}
      </Sider>
    );
  }
}

export default NavigationBar;
