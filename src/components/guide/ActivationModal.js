import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Button, Result, notification } from 'antd';

const failureNotification = (message) => {
    const args = {
        message: 'We are very sorry that we are unable to complete the Activation of this Program at this moment. Please try again after some time.',
        description: message.help,
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class ActivationModal extends Component {

    close = () => {
        const store = this.props.programStore;
        store.showActivationModal = false;
    }

    closeResult = () => {
        const store = this.props.programStore;
        store.showActivationResultModal = false;
    }

    activate = async () => {
        const store = this.props.programStore;
        await store.activate();

        if (store.isError) {
            failureNotification(store.message);
        }
    }

    render() {
        const store = this.props.programStore;

        return (
            <>
                <Modal
                    title="Please confirm the program activation"
                    visible={store.showActivationModal}
                    onOk={this.activate}
                    onCancel={this.close}
                    destroyOnClose>

                    <Result
                        title="Select Ok to activate this program."
                        subTitle="The Program will be visible to the world after the successful activation." />
                </Modal>

                <Modal
                    title="Program Activation"
                    visible={store.showActivationResultModal}
                    onCancel={this.closeResult}
                    footer={[
                        <Button key="back" onClick={this.closeResult}>
                            Ok
                        </Button>,
                    ]}
                    destroyOnClose>

                    <Result
                        status="success"
                        title="You have successfully activated this program."
                        subTitle="Now, this program is live and visible to the world." />
                </Modal>
            </>
        );
    }
}
export default ActivationModal