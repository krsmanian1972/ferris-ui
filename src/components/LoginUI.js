import React, { Component } from 'react';
import { Button, Form, Input, Card, Typography, notification, message } from 'antd';
import { observer, inject } from 'mobx-react';
import About from './About';

const { Title } = Typography;

const loginCard = {
    marginLeft: "25%",
    width: "50%",
    borderRadius: 12,
};

const failureNotification = () => {
    const args = {
        message: 'Service Unavailable',
        description:
            'We are very sorry that we are unable to serve you at this moment. Please try after some time.',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@inject('appStore')
@observer
export default class LoginScreen extends Component {
    render() {
        const store = this.props.appStore;

        return (
            <>
                <Card style={loginCard} title={<Title level={4}>Login</Title>}>
                    <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >
                        <Form.Item name="email"
                            rules={[{ required: true, message: 'Please enter your registered email id.' }]}
                            label="EMAIL">
                            <Input />
                        </Form.Item>

                        <Form.Item name="password"
                            rules={[{ required: true, message: 'Please provide your password.' }]}
                            label="PASSWORD">
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={store.isLoading}>LOGIN</Button>
                        </Form.Item>

                    </Form>
                </Card>

                <div style={{ textAlign: 'center', marginTop: 20, marginBottom:20 }}>
                    <Button style={{ color: "blue" }} type="link" disabled={store.isLoading}>DON'T HAVE AN ACCOUNT? WRITE TO US</Button>
                </div>

                <div>
                    <About />
                </div>
            </>
        );
    }

    onFinish = async (values) => {
        const store = this.props.appStore;
        await store.authenticate(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isInvalid) {
            message.warning('Invalid Login Details.');
        }
    };
}
