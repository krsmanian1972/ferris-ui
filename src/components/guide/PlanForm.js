import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Form, Input, notification, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

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
        message: 'Unable to Create Plan',
        description:
            'We are unavailable at this moment. Please try after some time.',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class PlanForm extends Component {

    formRef = React.createRef();

    onFinish = async (values) => {

        const store = this.props.planStore;

        await store.createPlan(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('The Plan is created.');
        }
    }


    render() {

        const store = this.props.planStore;

        return (
            <Form {...formItemLayout} name="planForm" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item name="name"
                    rules={[{ required: true, message: 'Please provide a simple name for this Plan' }]}
                    label="Plan Name">
                    <Input placeholder="Name of the Plan" />
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please provide a short description about this Plan' }]}
                    label="Short Description">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Create Plan</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default PlanForm;