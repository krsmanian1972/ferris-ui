import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import { Typography } from 'antd';

import SignIn from './SignIn';
import About from './About';

import { pageTitle } from './util/Style';

const { Title } = Typography;

@inject('appStore')
@observer
class LoginScreen extends Component {

    getPlatformIntro = () => {
        return (
            <Title level={4}>A place for coaches and mentees to collaborate</Title>
        )
    }

    render() {

        return (
            <div style={{marginRight:5, marginLeft:5}}>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center", background:"#fafafa"}}>
                    <div style={{ width: "50%", textAlign: "center"}}>
                        {pageTitle("A place for collaboration")}
                    </div>
                    <div style={{ width: "50%", textAlign: "left" }}>
                        <SignIn />
                    </div>
                </div>
                <About />
            </div>
        );
    }
}

export default LoginScreen