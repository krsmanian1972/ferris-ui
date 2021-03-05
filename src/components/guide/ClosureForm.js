import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { Button, Form, Input, notification, message } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Perform Closure',
        description:
            'We are very sorry. We are unable to complete your request. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class ClosureForm extends Component {

    formRef = React.createRef();

    description = "";

    disabledDate = (current) => {
        return current && current < moment().startOf('day');
    }

    validateDate = (value) => {
        this.props.store.validateDate(value);
    }

    handleDescription = (text) => {
        this.description = text;
        this.formRef.current && this.formRef.current.setFieldsValue({ closingNotes: text });
    }

    
    onFinish = async (values) => {
        const store = this.props.store;
        await store.performClosure(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            if(this.props.store.targetState==="DONE") {    
                message.success('The activity is marked as Done.')
            }
            else {
                message.success('The activity is marked as Cancelled.')
            }
        }
    }

    getSaveIcon = () => {
        if(this.props.store.targetState==="DONE") {
            return <CheckOutlined/>;
        }
    
        return <CloseOutlined/>
    }

    getSaveLabel = () => {
        if(this.props.store.targetState==="DONE") {
            return "Complete";
        }
        return "Mark this activity as Cancelled.";
    }

    render() {

        const store = this.props.store;

        // eslint-disable-next-line
        const change = store.change;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >
                <Form.Item
                    name="closingNotes"
                    rules={[{ required: true, message: 'Please provide a closure summary.' }]}
                    label="Closing Notes">
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="cn_desc" value={this.description} onChange={this.handleDescription} height={300} />
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={this.getSaveIcon()}>{this.getSaveLabel()}</Button>
                </Form.Item>
            </Form>
        );
    }

}

export default ClosureForm;