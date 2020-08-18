import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined, EditOutlined } from '@ant-design/icons';

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
    
    handleDescription = (text) => {
        this.formRef.current && this.formRef.current.setFieldsValue({ description: text });
    }

    componentDidMount() {
        
        const store = this.props.observationStore;
        const {description} = store.currentObservation;

        this.formRef.current && this.formRef.current.setFieldsValue({ description: description });
    }

    onFinish = async (values) => {
        const store = this.props.observationStore;
        await store.saveObservation(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Observation is Created.')
        }
    }

    getSaveIcon = () => {
        const store = this.props.observationStore;
        if(store.isNewObservation) {
            return <PlusCircleOutlined/>
        }
        return <EditOutlined/>
    }

    getSaveLabel = () => {
        const store = this.props.observationStore;
        if(store.isNewObservation) {
            return "Create Observation"
        }

        return "Update Observation"
    }

    render() {

        const store = this.props.observationStore;
        const {description} = store.currentObservation;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please describe the observation.' }]}
                    label="Observation">
                    
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>    
                    
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor ref={this.editorRef} value={description} id="desc_editor" onChange={this.handleDescription} height={300} />
                    </div>
                </Form.Item>

                
                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={this.getSaveIcon()}>{this.getSaveLabel()}</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ObservationForm;