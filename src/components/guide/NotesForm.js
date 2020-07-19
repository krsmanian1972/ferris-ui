import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { DatePicker, Button, Form, Input, Upload, notification, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const failureNotification = () => {
    const args = {
        message: 'Unable to Save the Notes',
        description:
            'We are very sorry. We are unable to save the notes at this moment. Please try after some time.',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};


@observer
class NotesForm extends Component {

    formRef = React.createRef();

    componentDidMount() {
        //this.formRef.current.setFieldsValue({programName:'Rust the future'});
    }

    disabledDate = (current) => {
        return current && current < moment().startOf('day');
    }

    warningNotification = (help) => {
        const args = {
            message: 'Requires your attention',
            description: help,
            duration: 0,
            type: 'warning',
        };
        notification.open(args);
    };

    /**
     * 
     * Disable the Button and enable if error.
     * 
     */
    onFinish = async (values) => {

        const store = this.props.notesStore;

        await store.createNotes(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isInvalid) {
            this.warningNotification(store.message.help);
        }

        if (store.isDone) {
            this.formRef.current.resetFields();
            message.success('Notes Saved');
        }
    }

    
    normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    render() {

        const fuzzyId = this.props.notesStore.sessionUserFuzzyId;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >
                <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'The Note is blank. It is not permitted to save.' }]}
                    label="Notes">
                    <TextArea rows={5} />
                </Form.Item>

                <Form.Item name="remindAt" label="Remind me at">
                    <DatePicker showTime format="DD-MMM-YYYY HH:mm A" disabledDate={this.disabledDate}/>
                </Form.Item>

                <Form.Item
                    name="upload"
                    label="Upload"
                    valuePropName="fileList"
                    getValueFromEvent={this.normFile}
                >
                    <Upload name={fuzzyId} action="http://localhost:8088/upload" listType="picture" >
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