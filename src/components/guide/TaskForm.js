import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { DatePicker, Button, Form, Input, InputNumber, notification, message } from 'antd';
import { PlusCircleOutlined, EditOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Create Task',
        description:
            'We are very sorry. We are unable to create the task. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class TaskForm extends Component {

    formRef = React.createRef();

    description = "";

    disabledDate = (current) => {
        return current && current < moment().startOf('day');
    }

    validateDate = (value) => {
        this.props.taskStore.validateDate(value);
    }

    handleDescription = (text) => {
        this.description = text;
        this.formRef.current && this.formRef.current.setFieldsValue({ description: text });
    }

    componentDidMount() {

        const store = this.props.taskStore;
        if(store.isNewTask) {
            return;
        }

        const {description, name, scheduleStart, duration} = store.currentTask;
        const localeStart = moment(scheduleStart*1000);

        this.formRef.current && this.formRef.current.setFieldsValue({ description: description, name:name, startTime: localeStart, duration: duration });
        this.description = description;
        store.change=moment();
    }

    onFinish = async (values) => {
        const store = this.props.taskStore;
        await store.saveTask(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Task is Created.')
        }
    }

    getSaveIcon = () => {
        const store = this.props.taskStore;
        if(store.isNewTask) {
            return <PlusCircleOutlined/>
        }
        return <EditOutlined/>
    }

    getSaveLabel = () => {
        const store = this.props.taskStore;
        if(store.isNewTask) {
            return "Create Activity"
        }

        return "Update Activity"
    }

    render() {

        const store = this.props.taskStore;
        const startTimeMsg = store.startTimeMsg;
        const change = store.change;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >
                <Form.Item 
                    name="name"
                    rules={[{ required: true, message: 'This is the name of the activity to quickly identify.' }]}
                    label="Task Name">
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please describe the task and provide a measure for the outcome.' }]}
                    label="Task Description">
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="task_desc" value={this.description} onChange={this.handleDescription} height={300} />
                    </div>
                </Form.Item>

                <Form.Item
                    name="startTime"
                    rules={[{ required: true, message: 'Please select a Start Time for this activity' }]}
                    label="Start Time"
                    validateStatus={startTimeMsg.status}
                    help={startTimeMsg.help}>

                    <DatePicker showTime format="DD-MMM-YYYY HH:mm A" disabledDate={this.disabledDate} onChange={this.validateDate} />
                </Form.Item>

                <Form.Item
                    name="duration"
                    rules={[{ required: true, message: 'Please provide a duration for this activity' }]}
                    label="Duration (Hrs)">
                    <InputNumber min={1} max={8} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={this.getSaveIcon()}>{this.getSaveLabel()}</Button>
                </Form.Item>
            </Form>
        );
    }

}

export default TaskForm;