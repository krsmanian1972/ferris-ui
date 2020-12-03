import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

const failureNotification = (reason) => {
    const args = {
        message: 'Unable to associate the coach',
        description:reason, 
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class CoachAssociationForm extends Component {

    formRef = React.createRef();

    onFinish = async (values) => {
        const store = this.props.programStore;

        await store.associateCoach(values);

        if (store.isInvalid) {
            failureNotification(store.message);
        }

        if (store.isDone) {
            message.success('The coach is associated.');
        }
    }

    render() {

        const store = this.props.programStore;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item name="email"
                    rules={[{ required: true, message: 'Please provide the registed email of the Coach' }]}
                    label="Registered Email of the coach">
                    <Input placeholder="email of the coach" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Associate</Button>
                </Form.Item>

            </Form>
        );
    }
}
export default CoachAssociationForm;