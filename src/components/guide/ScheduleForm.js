import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { DatePicker, Select, Button, Form, Input, Tooltip, InputNumber, notification, message } from 'antd';
import { QuestionCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

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
        message: 'Unable to Create Schedule',
        description:
            'We are very sorry. We are unable to create the requested schedule at this moment. Please try after some time.',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class ScheduleForm extends Component {

    formRef = React.createRef();

    componentDidMount() {
        const store = this.props.sessionStore;
        store.programListStore.fetchCoachPrograms();
    }

    disabledDate = (current) => {
        return current && current < moment().startOf('day');
    }

    validateDate = (value) => {
        this.props.sessionStore.validateDate(value);
    }

    /**
     * 
     * Disable the Button and enable if error.
     * 
     */
    onFinish = async (values) => {
        const store = this.props.sessionStore;

        await store.createSchedule(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isInvalid) {
            message.warning('Need Additional Information.');
        }

        if (store.isDone) {
            message.success('Schedule is created.');
        }
    }

    onProgramChange = (programId) => {
        const store = this.props.sessionStore;
        this.formRef.current.setFieldsValue({ memberId: '' });
        store.enrollmentListStore.fetchEnrollments(programId);
    }

    getProgramLabel = () => {
        return (
            <span>
                Program Name&nbsp;
                <Tooltip title="This session will be attached to the selected program. We display only the active programs.">
                    <QuestionCircleOutlined />
                </Tooltip>
            </span>
        );
    }

    pick = (msg1, msg2) => {
        if (msg1.status === "error") {
            return msg1;
        }
        return msg2;
    }

    render() {

        const store = this.props.sessionStore;

        const programs = store.programListStore.programs;
        const programMsg = this.pick(store.programListStore.message, store.programMsg);

        const members = store.enrollmentListStore.members;
        const memberMsg = this.pick(store.enrollmentListStore.message, store.memberMsg);

        const startTimeMsg = store.startTimeMsg;

        return (
            <Form {...formItemLayout} ref={this.formRef} onFinish={this.onFinish} >
                <Form.Item name="programId"
                    rules={[{ required: true, message: 'Please select a Program' }]}
                    label={this.getProgramLabel()}
                    validateStatus={programMsg.status}
                    help={programMsg.help}>

                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Select an active Program"
                        onChange={this.onProgramChange}>
                        {programs.map(item => {
                            if (item.program.active) {
                                return <Option key={item.program.id}>{item.program.name}</Option>
                            }
                        })}
                    </Select>
                </Form.Item>

                <Form.Item name="memberId"
                    rules={[{ required: true, message: 'Please select an enrolled member for the Program' }]}
                    label="Enrolled Member"
                    validateStatus={memberMsg.status}
                    help={memberMsg.help}>

                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Select an enrolled Member">
                        {members.map(item => (
                            <Option key={item.id}>{item.searchable}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="name"
                    rules={[{ required: true, message: 'Please provide a topic for this session' }]}
                    label="Session Name">
                    <Input placeholder="Topic for this session" />
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please provide a short description about this session' }]}
                    label="Short Description">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="startTime"
                    rules={[{ required: true, message: 'Please select the Start Time for this session' }]}
                    label="Start Time"
                    validateStatus={startTimeMsg.status}
                    help={startTimeMsg.help}>

                    <DatePicker showTime format="DD-MMM-YYYY HH:mm A" disabledDate={this.disabledDate} onChange={this.validateDate} />
                </Form.Item>

                <Form.Item
                    name="duration"
                    rules={[{ required: true, message: 'Please provide a duration for this session' }]}
                    label="Duration (Hrs)">
                    <InputNumber min={1} max={8} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Create Schedule</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ScheduleForm;