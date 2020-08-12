import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Create Option',
        description:
            'We are very sorry. We are unable to create the option. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class ConstraintForm extends Component {
    
    formRef = React.createRef();
    description = "";

    handleDescription = (text) => {
        this.description = text;
        this.formRef.current.setFieldsValue({ description: this.description });
    }

    onFinish = async (values) => {
        const store = this.props.constraintStore;
        await store.createOption(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Option is Created.')
        }
    }

    render() {

        const store = this.props.constraintStore;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please capture the constraints and options.' }]}
                    label="Constraints And Option">
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="option_desc" value={this.description} onChange={this.handleDescription} height={300} />
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Create Option</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ConstraintForm;