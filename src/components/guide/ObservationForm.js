import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import Editor from "../commons/Editor";

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Create Observation',
        description:
            'We are very sorry. We are unable to create the observation. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class ObservationForm extends Component {
    
    formRef = React.createRef();
    description = "";

    handleDescription = (text) => {
        this.description = text;
        this.formRef.current.setFieldsValue({ description: this.description });
    }

    onFinish = async (values) => {
        const store = this.props.observationStore;
        await store.createObservation(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Observation is Created.')
        }
    }

    render() {

        const store = this.props.observationStore;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please describe the observation.' }]}
                    label="Observation">
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="observation_desc" value={this.description} onChange={this.handleDescription} height={300} />
                    </div>
                </Form.Item>
                

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Create Observation</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ObservationForm;