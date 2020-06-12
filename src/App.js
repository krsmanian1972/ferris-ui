import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { Layout } from 'antd';
import { Affix, Button, Tooltip } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

import ToolBar from './components/ToolBar';
import About from './components/About';
import SelectedComponent from './components/SelectedComponent'

import { appStore } from './components/stores/AppStore';
import { drawerStore } from './components/stores/DrawerStore';

const { Header, Content, Footer } = Layout;

export default class App extends Component {

 
  render() {
    appStore.authenticate();

    return (
      <Provider appStore={appStore} drawerStore={drawerStore}>
        <Layout>
          <ToolBar />
          <Content className="site-layout" style={{ padding: '0 0px', marginTop: 64 }}>
            <div className="site-layout-background" style={{ padding: 5, minHeight: 400 }}>
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
