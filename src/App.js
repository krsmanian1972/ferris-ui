import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { Layout, Menu, Breadcrumb } from 'antd';

import ToolBar from './components/ToolBar';
import About from './components/About';
import SelectedComponent from './components/SelectedComponent'

import { appStore } from './components/stores/AppStore';
import { drawerStore } from './components/stores/DrawerStore';

const { Header, Content, Footer } = Layout;

export default class App extends Component {

  handleEvent = (e) => {
    appStore.navigateTo(e.key);
  }

  renderRoleTabs = () => {
    return (
      <Menu theme="light" mode="horizontal" defaultSelectedKeys={['0']}>
        {
          appStore.menus.map((item, index) => (
            <Menu.Item key={index} onClick={this.handleEvent} >{item.label}</Menu.Item>)
          )
        }
      </Menu>
    )
  }

  
  render() {
    appStore.authenticate();

    return (
      <Provider appStore={appStore} drawerStore={drawerStore}>
        <Layout>
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: '#fff' }}>
            <div className="logo" />
            <ToolBar />
            {this.renderRoleTabs()}
          </Header>
          <Content className="site-layout" style={{ padding: '0 0px', marginTop: 64 }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }}>
              <SelectedComponent />
            </div>
          </Content>
          <Footer style={{ padding: '0 0px' }}>
            <About />
          </Footer>
        </Layout>
      </Provider>
    )
  }
}
