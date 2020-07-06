import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { DatePicker, Button, Form, Input, Tooltip, InputNumber} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

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

    handleSave = (e) => {
        
        
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
            <Form {...formItemLayout} ref={this.formRef} onFinish={this.handleSave} >
                <Form.Item 
                        name="programName" 
                        rules={[{ type: 'string', required: true, message: 'Please select Program Name' }]}
                        label={this.getProgramLabel()}>
                    <Input onChange={this.markAsDirty} />
                </Form.Item>

                <Form.Item 
                        name="startTime"  
                        rules={[{ type: 'object', required: true, message: 'Please select Session Start Time' }]}
                        label="Start Time">
                    <DatePicker showTime format="DD-MMM-YYYY HH:mm A" />
                </Form.Item>

                <Button onClick={this.handleSave} type="primary">Save</Button>
            </Form>
        );
    }
}
export default ScheduleForm;