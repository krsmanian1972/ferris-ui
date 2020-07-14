import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {Button, Form, Input} from 'antd';

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
class ProgramForm extends Component {

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
        this.props.programStore.createProgram(values);
    }
   
    render() {

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >
                
                <Form.Item name="name"  
                        rules={[{ required: true, message: 'This is the offering from you to a student through a series of sessions.' }]}
                        label="Program Name">
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'The Program Description is ideal to have. Please do not leave it blank.' }]}
                    label="Description">
                    <TextArea rows={5} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default ProgramForm;