import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { DatePicker, Button, Form, Input, Tooltip, InputNumber} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

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


@observer
class ScheduleForm extends Component {

    formRef = React.createRef();

    componentDidMount() {
        //this.formRef.current.setFieldsValue({programName:'Rust the future'});
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
        //this.props.sessionStore.createSchedule(values);
    }

    markAsDirty = (e) => {
        const store = this.props.sessionStore;
        store.isDirty = true;
    }

    getProgramLabel = ()=>{
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

        return (
            <Form {...formItemLayout} ref={this.formRef} onFinish={this.onFinish} >
                <Form.Item name="programId" 
                        rules={[{ required: true, message: 'Please select a Program' }]}
                        label={this.getProgramLabel()}>
                    <InputNumber/>
                </Form.Item>

                <Form.Item name="name"  
                        rules={[{ required: true, message: 'This is the topic of the session' }]}
                        label="Session Name">
                    <Input/>
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
                        label="Start Time">
                    <DatePicker showTime format="DD-MMM-YYYY HH:mm A" />
                </Form.Item>

                <Form.Item 
                        name="duration"  
                        rules={[{ required: true, message: 'Please provide a duration for the session' }]}
                        label="Duration">
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