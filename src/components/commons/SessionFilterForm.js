import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { DatePicker, Button, Form, notification,message } from 'antd';

const failureNotification = () => {
    const args = {
        message: 'Unable to Generate Report',
        description:
            'We are very sorry. We are unable to generate the report. Please try again after some time',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class SessionFilterForm extends Component {
    
    formRef = React.createRef();

    validateStartDate = (date) => {
        this.props.store.validateStartDate(date);
    }

    validateEndDate = (endDate) => {
        this.props.store.validateEndDate(endDate);
    }

    componentDidMount() {
        const store = this.props.store;
        const localeStart = store.startTime;
        const localeEnd = store.endTime;

        this.formRef.current && this.formRef.current.setFieldsValue({startTime: localeStart, endTime: localeEnd});
        store.change=moment();
    }

    onFinish = async (values) => {
        const store = this.props.store;
        await store.generateReport(this.props.programId,this.props.userId,values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isInvalid) {
            message.warning('Please correct the parameters');
        }
    }

    render() {

        const store = this.props.store;
        const startTimeMsg = store.startTimeMsg;
        const endTimeMsg = store.endTimeMsg;
        const change = store.change;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                <Form.Item
                    name="startTime"
                    rules={[{ required: true, message: 'Please provide a start date of the reporting period.' }]}
                    label="Start Date"
                    validateStatus={startTimeMsg.status}
                    help={startTimeMsg.help}>

                    <DatePicker format="DD-MMM-YYYY" onChange={this.validateStartDate}/>
                </Form.Item>

                <Form.Item
                    name="endTime"
                    rules={[{ required: true, message: 'Please provide an end date of the reporting period.' }]}
                    label="End Date"
                    validateStatus={endTimeMsg.status}
                    help={endTimeMsg.help}>

                    <DatePicker format="DD-MMM-YYYY" onChange={this.validateEndDate}/>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" >Generate Report</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default SessionFilterForm;