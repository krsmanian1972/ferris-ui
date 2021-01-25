import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Select, Button, Form, Tooltip, notification, message } from 'antd';
import { QuestionCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const MEMBER_LABEL = "The list of members enrolled in this program.";

const failureNotification = () => {
    const args = {
        message: 'Unable to Include',
        description:
            'We are very sorry. We are unable to include the member.',
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class ConferenceInvitationForm extends Component {

    formRef = React.createRef();

    message = "";

    handleMessage = (text) => {
        this.message = text;
        this.formRef.current && this.formRef.current.setFieldsValue({ message: text });
    }

    pick = (msg1, msg2) => {
        if (msg1.status === "error") {
            return msg1;
        }
        return msg2;
    }

    renderMembers = () => {

        const store = this.props.sessionStore;

        const members = store.enrollmentListStore.members;
        const memberMsg = this.pick(store.enrollmentListStore.message, store.memberMsg);

        return (
            <Form.Item name="memberId"
                rules={[{ required: true, message: 'Please select an enrolled member' }]}
                label={this.getMemberLabel()}
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
        )
    }

    getMemberLabel = () => {
        return (
            <span>
                Enrolled Member&nbsp;
                <Tooltip title={MEMBER_LABEL}>
                    <QuestionCircleOutlined />
                </Tooltip>
            </span>
        );
    }


    onFinish = async (values) => {
        const store = this.props.sessionStore;
        await store.addConferenceMember(values);

        if (store.isError) {
            failureNotification();
        }

        if (store.isDone) {
            message.success('The member is included in the conference');
        }
    }

    render() {

        const store = this.props.sessionStore;

        return (
            <Form layout="vertical" ref={this.formRef} onFinish={this.onFinish} >

                {this.renderMembers()}

                <Form.Item>
                    <Button type="primary" disabled={store.isLoading} htmlType="submit" icon={<PlusCircleOutlined />}>Invite</Button>
                </Form.Item>

            </Form>
        );
    }
}
export default ConferenceInvitationForm;