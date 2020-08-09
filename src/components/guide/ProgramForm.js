import React, { Component } from 'react';
import { observer } from 'mobx-react';

import {Button, Form, Input, notification,message} from 'antd';
import { PlusCircleOutlined} from '@ant-design/icons';

const { TextArea } = Input;

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
            message.success('Draft Program is Created.')
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
                    rules={[{ required: true, message: 'Start with a short description. Of course, you can elaborate this later, before activating this program.' }]}
                    label="Short Description">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={store.isLoading} icon={<PlusCircleOutlined/>}>Create Draft Program</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ProgramForm;