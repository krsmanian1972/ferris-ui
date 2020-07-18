import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {Button, Form, Input, notification,message} from 'antd';

const { TextArea } = Input;

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};

const failureNotification = () => {
    const args = {
      message: 'Unable to Create Program',
      description:
        'We are very sorry. It seems that the service is unavailable, at this time, to help you complete the creation of this program. Please try after some time.',
      duration: 0,
      type:'error',
    };
    notification.open(args);
  };


@observer
class ProgramForm extends Component {

    formRef = React.createRef();

    componentDidMount() {
        //this.formRef.current.setFieldsValue({programName:'Rust the future'});
    }

    /**
     * 
     * Disable the Button and enable if error.
     * 
     */
    onFinish = async(values) => {
        const store = this.props.programStore;

        await store.createProgram(values);
        
        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('Program is created.')
        }
    }
   
    render() {
        const store = this.props.programStore;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >
                
                <Form.Item name="name"  
                        rules={[{ required: true, message: 'This is the name of the offering, from you, to an enrolled member, through a series of sessions. Please do not leave it blank.' }]}
                        label="Program Name">
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'The Program Description will be very useful, for a person, to enroll in this program. Please do not leave it blank.' }]}
                    label="Description">
                    <TextArea rows={5} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={store.isLoading}>Save</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ProgramForm;