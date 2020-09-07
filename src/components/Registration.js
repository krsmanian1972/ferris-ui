import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Form, Input, Card, Typography, notification } from 'antd';
import { LoginOutlined } from '@ant-design/icons';

import LoginStore from './stores/LoginStore';
import About from './About';

const { Title } = Typography;

const loginCard = {
    marginLeft: "25%",
    width: "50%",
    borderRadius: 12,
};

const failureNotification = (reason) => {
    const args = { 
            message: "Unable to register.", 
            description: reason, 
            duration: 3, 
            type: 'error' 
    };

    notification.open(args);
};

const successNotification = () => {
    const args = { 
            message: "Welcome to Ferris!!!",
            description: "Please Login by using the registered email and password.", 
            duration: 5, 
            type: 'success' 
    };

    notification.open(args);
};

@inject('appStore')
@observer
export default class Registration extends Component {

    constructor(props) {
        super(props);
        this.loginStore = new LoginStore({ apiProxy: props.appStore.apiProxy});
    }

    render() {

        return (
            <>
                <Card style={loginCard} title={<Title level={4}>Registration</Title>}>
                    <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                        <Form.Item name="fullName"
                            rules={[{ required: true, message: 'Your name please.' }]}
                            label="FULL NAME">
                            <Input />
                        </Form.Item>

                        <Form.Item name="email"
                            rules={[{ required: true, message: 'Please enter an email id for communication.' }]}
                            label="EMAIL">
                            <Input />
                        </Form.Item>

                        <Form.Item name="password"
                            rules={[{ required: true, message: 'Please provide a password to protect your account.' }]}
                            label="PASSWORD">
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={this.loginStore.isLoading}>CREATE ACCOUNT</Button>
                        </Form.Item>

                    </Form>
                </Card>

                <div style={{ textAlign: 'center',marginTop: 20, marginBottom: 20 }}>
                    <Button style={{ color: "blue" }} disabled={this.loginStore.isLoading} onClick={this.login} icon={<LoginOutlined/>}>BACK TO LOGIN</Button>
                </div>
                
                <div>
                    <About />
                </div>
            </>
        );
    }

    onFinish = async (values) => {
        await this.loginStore.registerUser(values);

        if (this.loginStore.isError) {
            failureNotification(this.loginStore.message.help);
        }

        if(this.loginStore.isDone) {
            successNotification();
            const params = { parentKey: "" };
            this.props.appStore.currentComponent = { label: "Login", key: "login", params: params };
        }
    };

    login = () => {
        const params = { parentKey: "" };
        this.props.appStore.currentComponent = { label: "Login", key: "login", params: params };
    };
  
}
