import React, { Component } from 'react';
import { Card, Typography, Button, Row, Col } from 'antd';
import { observer, inject } from 'mobx-react';
import { inputField, passwordField } from './InputElements';

const { Title, Text } = Typography;

const loginCard = {
    marginLeft:"15%",
    marginRight:"15%",
    display: 'flex',
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign:'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    fontWeight:'bold',
};

@inject('appStore')
@observer
export default class LoginScreen extends Component {
    render() {
        const appStore = this.props.appStore;
        const loginStore = appStore.loginStore;
        const loginCredentials = loginStore.loginCredentials;

        return (

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
                        {this.renderMessage()}
                    </Col>
                </Row>
            </Card>
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
