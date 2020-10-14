import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Send Invitation',
        description:
            'We are very sorry. We are unable to enroll the member',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class InvitationForm extends Component {

    formRef = React.createRef();

    message = "";

    handleMessage = (text) => {
        this.message = text;
        this.formRef.current && this.formRef.current.setFieldsValue({ message: text });
    }

    onFinish = async (values) => {
        const store = this.props.store;
        await store.enrollMember(this.props.programId, values, this.getSubject());

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('The invitation will be sent.');
            this.props.listStore.fetchEnrollments(this.props.programId,'NEW');
        }
    }

    getSubject = () => {
        return `You are enrolled into ${this.props.programName}`
    }

    render() {

        const store = this.props.store;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item name="email"
                    rules={[{ required: true, message: 'Please provide the email of the registered member.' }]}
                    label="Member Email">
                    <Input placeholder="email of the guest member" />
                </Form.Item>

                <Form.Item label="Subject">
                    <span className="ant-form-text">{this.getSubject()}</span>
                </Form.Item>

                <Form.Item
                    name="message"
                    rules={[{ required: true, message: 'Please write a message to the guest.' }]}
                    label="Invitation Message">

                    <div style={{ display: "none" }}><TextArea rows={1} /></div>

                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor value={this.message} id="message_editor" onChange={this.handleMessage} height={200} />
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Invite</Button>
                </Form.Item>

            </Form>
        );
    }
}
export default InvitationForm;