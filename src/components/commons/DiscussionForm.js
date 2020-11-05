import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification } from 'antd';

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Deliver Message',
        description:
            'We are very sorry. We are unable to deliver your message. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class DiscussionForm extends Component {

    formRef = React.createRef();

    onFinish = async (values) => {
        const store = this.props.store;
        await store.deliverMessage(values);

        if (store.isError) {
            failureNotification();
        }

        this.formRef.current && this.formRef.current.resetFields();
    }

    render() {
        const store = this.props.store;

        return (
            <div className="discussion-form">
                <Form layout="inline" ref={this.formRef} onFinish={this.onFinish} >
                    <Form.Item
                        style={{width:"75%"}}
                        name="description"
                        rules={[{ required: true, message: 'Please type a message to deliver' }]}>
                        <TextArea placeholder="Type your message here..." autoSize={{ minRows: 3, maxRows: 3 }} />
                    </Form.Item>

                    <Form.Item>
                        <Button style={{marginTop:"33.3%"}} type="primary" disabled={store.isLoading} htmlType="submit" >Send</Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
export default DiscussionForm;