import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { Layout } from 'antd';

import ToolBar from './components/ToolBar';
import SelectedComponent from './components/SelectedComponent'

import { appStore } from './components/stores/AppStore';
import { drawerStore } from './components/stores/DrawerStore';

const { Content, Footer } = Layout;

const minHeight = window.innerHeight * .89;

const BROADCAST_FEATURE_KEY = "broadcast";
const COACH_FEATURE_KEY = "coach";

export default class App extends Component {


  /**
   * Update the routing preference into the AppStore
   */
  updatePreferredRoute = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const featureKey = params.get("featureKey");

    if (featureKey && featureKey === BROADCAST_FEATURE_KEY) {
      this.broadcastRoute(params);
    }

    if (featureKey && featureKey === COACH_FEATURE_KEY) {
      this.coachProfileRoute(params);
    }

  }

  broadcastRoute = (params) => {
    const featureKey = params.get("featureKey");
    const sessionId = params.get("sessionId");
    const sessionUserId = params.get("sessionUserId");
    const sessionUserType = params.get("sessionUserType");

    const sessionInfo = {
      sessionId: sessionId,
      sessionUserId: sessionUserId,
      sessionUserType: sessionUserType,
      enrollmentId: params.get("enrollmentId"),
      memberId: params.get("memberId")
    };

    if (featureKey && sessionUserId) {
      appStore.updatePreferredRoute(featureKey, sessionInfo);
    }

  }

  coachProfileRoute = (params) => {
    const coachId = params.get("fuzzyId");
    if (coachId) {
      const compParams = { coachId: coachId, parentKey: "login" };
      appStore.currentComponent = { label: "AboutCoach", key: "aboutCoach", params: compParams };
    }
  }


  renderLayout = () => {

    if (appStore.hasSessionUserId) {
      return this.renderSessionLayout();
    }

    return this.renderRegularLayout();
  }

  renderRegularLayout = () => {

    return (
      <>
        <ToolBar />
        <Content className="site-layout" style={{ padding: '0 0px', marginTop: 64 }}>
          <div className="site-layout-background" style={{ padding: 2, minHeight: minHeight }}>
            <SelectedComponent />
          </div>
        </Content>
        <Footer style={{ padding: '0 0px' }}>
        </Footer>
      </>
    )
  }

  renderSessionLayout = () => {
    return (
      <>
        <Content className="site-layout">
          <div className="site-layout-background" style={{ padding: 5 }}>
            <SelectedComponent />
          </div>
        </Content>
      </>
    )
  }


  render() {

    this.updatePreferredRoute();

    return (
      <Provider appStore={appStore} drawerStore={drawerStore}>
        <Layout>
          {this.renderLayout()}
        </Layout>
      </Provider>
    )
  }
}
