import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { Button, Form, Input, notification, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Update your closing notes',
        description:
            'We are very sorry. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class ActionClosureForm extends Component {

    formRef = React.createRef();

    closingNotes = "";

    handleNotes = (text) => {
        this.closingNotes = text;
        this.formRef.current && this.formRef.current.setFieldsValue({ closingNotes: text });
    }

    componentDidMount() {

        const store = this.props.taskStore;
   
        const {closingNotes} = store.currentTask;

        this.closingNotes = closingNotes;
        this.formRef.current && this.formRef.current.setFieldsValue({ closingNotes: closingNotes });

        store.change=moment();
    }

    onFinish = async (values) => {
        const store = this.props.taskStore;
        await store.updateClosingNotes(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Closing Note is saved')
        }
    }
 
    render() {

        const store = this.props.taskStore;

        // eslint-disable-next-line
        const change = store.change;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="closingNotes"
                    rules={[{ required: true, message: 'Please provide your closing notes here.' }]}
                    label="Closing Notes">
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="task_clos" value={this.closingNotes} onChange={this.handleNotes} height={300} />
                    </div>
                </Form.Item>
                
                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<EditOutlined/>}>Save Closing Notes</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ActionClosureForm;