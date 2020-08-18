import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined,EditOutlined } from '@ant-design/icons';

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

    handleDescription = (text) => {
        this.formRef.current && this.formRef.current.setFieldsValue({ description: text });
    }

    componentDidMount() {
        
        const store = this.props.constraintStore;
        const {description} = store.currentOption;

        this.formRef.current && this.formRef.current.setFieldsValue({ description: description });
    }

    onFinish = async (values) => {
        const store = this.props.constraintStore;
        await store.saveOption(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Option is Created.')
        }
    }

    getSaveIcon = () => {
        const store = this.props.constraintStore;
        if(store.isNewOption) {
            return <PlusCircleOutlined/>
        }
        return <EditOutlined/>
    }

    getSaveLabel = () => {
        const store = this.props.constraintStore;
        if(store.isNewOption) {
            return "Create Constraints"
        }

        return "Update Constraints"
    }

    render() {

        const store = this.props.constraintStore;
        const {description} = store.currentOption;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please capture the constraints and options.' }]}
                    label="Constraints And Option">
                    
                    <div style={{ display: "none" }}><TextArea rows={1} /></div>
                    
                    <div style={{ border: "1px solid lightgray" }}>
                        <Editor id="option_desc" value={description} onChange={this.handleDescription} height={300} />
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={this.getSaveIcon()}>{this.getSaveLabel()}</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ConstraintForm;