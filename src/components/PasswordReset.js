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
            message: reason, 
            description: "We are unable to change the password.", 
            duration: 3, 
            type: 'error' 
    };

    notification.open(args);
};

const successNotification = () => {
    const args = { 
            message: "Password is changed.",
            description: "Please use the new password to login.", 
            duration: 5, 
            type: 'success' 
    };

    notification.open(args);
};

@inject('appStore')
@observer
export default class PasswordReset extends Component {

    constructor(props) {
        super(props);
        this.loginStore = new LoginStore({ apiProxy: props.appStore.apiProxy});
    }

    render() {

        return (
            <>
                <Card style={loginCard} title={<Title level={4}>Change Password</Title>}>
                    <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                        <Form.Item name="email"
                            rules={[{ required: true, message: 'Please enter your registered email id.' }]}
                            label="EMAIL">
                            <Input />
                        </Form.Item>

                        <Form.Item name="currentPassword"
                            rules={[{ required: true, message: 'Please provide your current password.' }]}
                            label="CURRENT PASSWORD">
                            <Input.Password />
                        </Form.Item>

                        <Form.Item name="newPassword"
                            rules={[{ required: true, message: 'Please provide a new password.' }]}
                            label="NEW PASSWORD">
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={this.loginStore.isLoading}>CHANGE PASSWORD</Button>
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
        await this.loginStore.resetPassword(values);

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
