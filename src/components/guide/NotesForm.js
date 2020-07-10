import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { DatePicker, Button, Form, Input,Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

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
class NotesForm extends Component {

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
        //this.props.notesStore.createNotes(values);
    }

    markAsDirty = (e) => {
        const store = this.props.notesStore;
        store.isDirty = true;
    }

    normFile = e => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
          return e;
        }
        return e && e.fileList;
    };

    render() {

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >
                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'The Note is blank. It is not permitted to save.' }]}
                    label="Notes">
                    <TextArea rows={5} />
                </Form.Item>

                <Form.Item name="reminderAt" label="Remind me at">
                    <DatePicker showTime format="DD-MMM-YYYY HH:mm A" />
                </Form.Item>

                <Form.Item
                    name="upload"
                    label="Upload"
                    valuePropName="fileList"
                    getValueFromEvent={this.normFile}
                >
                    <Upload name="logo" action="/upload.do" listType="picture">
                        <Button>
                            <UploadOutlined /> Click to upload
                        </Button>
                    </Upload>
                </Form.Item>
                
                <Form.Item>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        );
    }
}
export default NotesForm;