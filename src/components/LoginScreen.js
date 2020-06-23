import React, { Component } from 'react';
import { Card, Typography, Button, Row, Col } from 'antd';
import { observer, inject } from 'mobx-react';
import { inputField, passwordField } from './InputElements';
import signInImage from '../images/sign-in.png';
import krust from '../images/krust.svg';

const { Title, Text } = Typography;

const root = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
};

const loginCardWrapper = {
    height: '400px',
    display: 'flex',
    flex: 2,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
}

const imageStyle = {
    width: '250px',
    height: '155px',
    paddingTop: '20px',
    margin: '20px 0px 0px 20px',
    backgroundColor: "transparent",
}

const splitLeft = {
    height: '420px',
    width: '25%',
    display: 'inline-block',
    zIndex: '1',
    top: '0',
    overflowX: 'hidden',
    left: '10px',
    backgroundColor: 'lightgrey',
    borderRadius: "30px 0px 0px 30px",
    boxShadow: "15px 15px 5px grey",
}

const splitRight = {
    height: '420px',
    width: '25%',
    display: 'inline-block',
    zIndex: '1',
    top: '0',
    overflowX: 'hidden',
    right: '10px',
    backgroundColor: 'lightgrey',
    borderRadius: "0px 30px 30px 0px",
    boxShadow: "15px 15px 5px grey",
}

const loginCard = {
    display: 'flex',
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
};

const messageContainer = {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
}

@inject('appStore')
@observer
export default class LoginScreen extends Component {
    render() {
        const appStore = this.props.appStore;
        const loginStore = appStore.loginStore;
        const loginCredentials = loginStore.loginCredentials;

        return (
            <div style={root}>
                <div style={loginCardWrapper}>
                    <div style={splitLeft}>
                        <img src={signInImage} style={imageStyle} />
                        <img src={krust} style={imageStyle} />
                    </div>
                    <div style={splitRight}>
                        <Card bordered={false} style={loginCard} title={<Title level={4}>Login</Title>}>
                            <Row gutter={[8, 8]}>
                                <Col span={24}>
                                    {inputField('email', loginCredentials, true, 'loginField', 'Email')}
                                </Col>
                            </Row>
                            <Row gutter={[8, 8]}>
                                <Col span={24}>
                                    {passwordField('password', loginCredentials, true, 'loginField', 'Password')}
                                </Col>
                            </Row>
                            <Row gutter={[8, 8]}>
                                <Col span={24}>
                                    <Button loading={false} block type="primary" onClick={this.onSubmit}>Log in</Button>
                                </Col>
                            </Row>
                            <Row gutter={[10, 10]}>
                                <Col span={24}>
                                    <div style={messageContainer} >{this.renderMessage()}</div>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    renderMessage = () => {
        const store = this.props.appStore;
        const message = store.validationMessage;

        switch (store.state) {
            case 'error':
                {
                    return (
                        <Text type="danger" >{message}</Text>
                    )
                }
            case 'pending':
                {
                    return (
                        <Text type="warning" >{message}</Text>
                    )
                }
            case 'done':
                {
                    return (
                        <Text>{message}</Text>
                    )
                }
            default:
                {
                    return (
                        <Text>{message}</Text>
                    )
                }
        }

    }

    onSubmit = async () => {
        const store = this.props.appStore;
        await store.authenticate();
    };
}
