import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { DatePicker, Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Create Objective',
        description:
            'We are very sorry. We are unable to create the objective. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class ObjectiveForm extends Component {
    
    formRef = React.createRef();
    description = "";

    disabledDate = (current) => {
        return current && current < moment().startOf('day');
    }

    handleDescription = (text) => {
        this.description = text;
        this.formRef.current.setFieldsValue({ description: this.description });
    }

    onFinish = async (values) => {
        const store = this.props.objectiveStore;
        await store.createObjective(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Objective is Created.')
        }
    }

    render() {

        const store = this.props.objectiveStore;

        const startTimeMsg = store.startTimeMsg;
        const endTimeMsg = store.endTimeMsg;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please describe the objective and provide a measure for the outcome.' }]}
                    label="Objective Description">
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="objective_desc" value={this.description} onChange={this.handleDescription} height={300} />
                    </div>
                </Form.Item>

                <Form.Item
                    name="startTime"
                    rules={[{ required: true, message: 'Please provide a Start Date for working towards this objective.' }]}
                    label="Start Date"
                    validateStatus={startTimeMsg.status}
                    help={startTimeMsg.help}>

                    <DatePicker format="DD-MMM-YYYY" disabledDate={this.disabledDate} />
                </Form.Item>

                <Form.Item
                    name="endTime"
                    rules={[{ required: true, message: 'Please provide the date of acheiving this objective.' }]}
                    label="End Date"
                    validateStatus={endTimeMsg.status}
                    help={endTimeMsg.help}>

                    <DatePicker format="DD-MMM-YYYY" disabledDate={this.disabledDate} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Create Schedule</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ObjectiveForm;