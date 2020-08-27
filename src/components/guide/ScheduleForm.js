import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { DatePicker, Select, Button, Form, Input, Tooltip, notification, message, Typography, InputNumber, TimePicker } from 'antd';
import { QuestionCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;


const marks = {
    0: '0 min',
    15: '15',
    30: '30',
    45: '45 min'
}

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

    disabledHours = () => {
        return [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    }

    validateDate = (value) => {
        this.props.sessionStore.validateDate(value);
    }

    validateDuration = (value) => {
        this.props.sessionStore.validateDuration(value);
    }

    getEndTime = () => {
        const store = this.props.sessionStore;
        const endTime = store.endTime;
        if (endTime) {
            return (
                <span className="ant-form-text"><Moment format="llll" >{endTime}</Moment></span>
            )
        }
        return <></>
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
            message.warning('Please correct the session information.');
        }

        if (store.isDone) {
            message.success('Schedule is created.');
        }
    }

    /**
     * fetch the list of all the members enrolled into this program
     * @param {*} programId 
     */
    onProgramChange = (programId) => {
        const store = this.props.sessionStore;
        this.formRef.current.setFieldsValue({ memberId: '' });
        store.enrollmentListStore.fetchEnrollments(programId, 'ALL');
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

    getDurationLabel = () => {
        return (
            <span>
                Duration (Hrs : Min) &nbsp;
                <Tooltip title="The duration of this session. For example, if you want the session for 45 minutes, select 00 in the hour column followed by 45 in the minutes column in the picker. If you want the session for an hour, just select 01 followed by 00.">
                    <QuestionCircleOutlined />
                </Tooltip>
            </span>
        );
    }

    getEndTimeLabel = () => {
        return (
            <span>
                Ends At &nbsp;
                <Tooltip title="End time will be calcuated once you specify the start time and duration for this session.">
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
        const durationMsg = store.durationMsg;


        return (
            <Form {...formItemLayout}
                name="scheduleForm"
                ref={this.formRef}
                onFinish={this.onFinish} >
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
                    rules={[{required: true, message: 'Please provide a topic for this session' }]}
                    label="Session Name">
                    <Input placeholder="Topic for this session" />
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please provide a short description about this session' }]}
                    label="Agenda">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="startTime"
                    rules={[{ required: true, message: 'Please select the start time for this session' }]}
                    label="Starts At"
                    validateStatus={startTimeMsg.status}
                    help={startTimeMsg.help}>

                    <DatePicker
                        placeholder="When?"
                        showTime={{ format: 'hh:mm A' }}
                        showNow={false}
                        format="DD-MMM-YYYY hh:mm A"
                        disabledDate={this.disabledDate}
                        onChange={this.validateDate}
                        minuteStep={15} />
                </Form.Item>

                <Form.Item
                    name="duration"
                    label={this.getDurationLabel()}
                    rules={[{ required: true, message: 'Please select the duration of this session' }]}
                    validateStatus={durationMsg.status}
                    help={durationMsg.help}>

                    <TimePicker placeholder="How long?" showTime={{ format: 'HH:mm' }} showNow={false} format="HH:mm" disabledHours={this.disabledHours} onChange={this.validateDuration} hideDisabledOptions={true} minuteStep={15} />
                </Form.Item>

                <Form.Item
                    name="endTime"
                    label={this.getEndTimeLabel()}>
                    {this.getEndTime()}
                </Form.Item>


                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Create Schedule</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ScheduleForm;