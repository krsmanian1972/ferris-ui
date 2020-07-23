import React, { Component, Fragment } from 'react';
import {Button, Form, Input,Card,Typography } from 'antd';
import { observer, inject } from 'mobx-react';

const {Title} = Typography;
const loginCard = {
    marginLeft:"33.33%",
    width:"33.33%",
    backgroundColor: 'lightgray',
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
                            <Input.Password/>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={store.isLoading}>LOGIN</Button>
                        </Form.Item>
                    
                    </Form>
                </Card>

                <div style={{textAlign:'center', marginTop:30}}>
                    <Button type="link" disabled={store.isLoading}>DON'T HAVE AN ACCOUNT? REGISTER HERE</Button>
                </div>
            </>
        );
    }

    onFinish = async (values) => {
        const store = this.props.appStore;
        await store.authenticate(values);

        if(store.isError) {
            failureNotification();    
        }
    };
}
