import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { Button, Form, Input, notification, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Update Response',
        description:
            'We are very sorry. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class ActionResponseForm extends Component {

    formRef = React.createRef();

    response = "";

    handleResponse = (text) => {
        this.response = text;
        this.formRef.current && this.formRef.current.setFieldsValue({ response: text });
    }

    componentDidMount() {

        const store = this.props.taskStore;
   
        const {response} = store.currentTask;

        this.formRef.current && this.formRef.current.setFieldsValue({ response: response });
        this.response = response;

        store.change=moment();
    }

    onFinish = async (values) => {
        const store = this.props.taskStore;
        await store.updateResponse(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Response is saved')
        }
    }
 
    render() {

        const store = this.props.taskStore;
        const change = store.change;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="response"
                    rules={[{ required: true, message: 'Please elaborate your response here.' }]}
                    label="Response">
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="task_resp" value={this.response} onChange={this.handleResponse} height={300} />
                    </div>
                </Form.Item>
                
                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<EditOutlined/>}>Update Response</Button>
                </Form.Item>
            </Form>
        );
    }

}

export default ActionResponseForm;