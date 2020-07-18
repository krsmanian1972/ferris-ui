import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { DatePicker, Select, Spin, Button, Form, Input, Tooltip, InputNumber } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

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


@observer
class ScheduleForm extends Component {

    formRef = React.createRef();

    componentDidMount() {
        //this.formRef.current.setFieldsValue({programName:'Rust the future'});
        const store = this.props.sessionStore;
        store.programListStore.fetchPrograms();
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
    onFinish = (values) => {
        console.log(values);
        console.log(values.startTime.format());
        console.log(values.startTime.utc().format());

        this.props.sessionStore.createSchedule(values);
    }

    onProgramChange = (programFuzzyId) => {
        const store = this.props.sessionStore;
        this.formRef.current.setFieldsValue({memberFuzzyId:''});
        store.enrollmentListStore.fetchEnrollments(programFuzzyId);
    }

    getProgramLabel = () => {
        return (
            <span>
                Program Name&nbsp;
                <Tooltip title="This session will be attached to the selected program.">
                    <QuestionCircleOutlined />
                </Tooltip>
            </span>
        );
    }

    render() {
        
        const store = this.props.sessionStore;

        const programs = store.programListStore.programs;
        const programMsg = store.programListStore.message;

        const members = store.enrollmentListStore.members;
        const memberMsg = store.enrollmentListStore.message;

        const startTimeMsg = store.startTimeMsg;

        return (
            <Form {...formItemLayout} ref={this.formRef} onFinish={this.onFinish} >
                <Form.Item name="programFuzzyId"
                    rules={[{ required: true, message: 'Please select a Program' }]}
                    label={this.getProgramLabel()}
                    validateStatus={programMsg.status}
                    help={programMsg.help}>

                    <Select 
                        showSearch 
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Select a Program"
                        onChange={this.onProgramChange}>
                        {programs.map(item => (
                            <Option key={item.program.fuzzyId}>{item.program.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="memberFuzzyId"
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
                            <Option key={item.fuzzyId}>{item.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="name"
                    rules={[{ required: true, message: 'Please provide a topic of the session' }]}
                    label="Session Name">
                    <Input placeholder="Topic for the session"/>
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please provide a short description about this session' }]}
                    label="Short Description">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="startTime"
                    rules={[{ required: true, message: 'Please select the Start Time of this session' }]}
                    label="Start Time"
                    validateStatus={startTimeMsg.status}
                    help={startTimeMsg.help}>

                    <DatePicker showTime format="DD-MMM-YYYY HH:mm A" disabledDate={this.disabledDate} onChange={this.validateDate}/>
                </Form.Item>

                <Form.Item
                    name="duration"
                    rules={[{ required: true, message: 'Please provide a duration for the session' }]}
                    label="Duration (Hrs)">
                    <InputNumber min={1} max={8} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ScheduleForm;