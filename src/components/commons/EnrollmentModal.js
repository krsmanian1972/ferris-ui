import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Button, Result, notification } from 'antd';

const failureNotification = (message) => {
    const args = {
        message: 'Unable to Complete Your Enrollment',
        description: message.help,
        duration: 0,
        type: 'error',
    };
    notification.open(args);
};

@observer
class EnrollmentModal extends Component {

    close = () => {
        const store = this.props.enrollmentStore;
        store.showEnrollmentModal = false;
    }

    closeResult = () => {
        const store = this.props.enrollmentStore;
        store.showResultModal = false;
    }

    enroll = async () => {
        const store = this.props.enrollmentStore;
        const selectedProgramId = store.selectedProgram.id;
        await store.createEnrollment();

        if (store.isError) {
            failureNotification(store.message);
        }

        if (store.isDone) {
            this.props.programStore.load(selectedProgramId);
        }
    }

    render() {
        const store = this.props.enrollmentStore;
        const coachName = store.selectedCoach ? store.selectedCoach.name : "";
        const subTitle = `The coach, ${coachName}, will contact you to customize the coaching plan.`

        return (
            <>
                <Modal
                    title="Please confirm Program Enrollment"
                    visible={store.showEnrollmentModal}
                    onOk={this.enroll}
                    onCancel={this.close}
                    destroyOnClose>

                    <Result
                        title="Select Ok to enroll in this program."
                        subTitle={subTitle} />
                </Modal>

                <Modal
                    title="Program Enrollment"
                    visible={store.showResultModal}
                    onCancel={this.closeResult}
                    footer={[
                        <Button key="back" onClick={this.closeResult}>
                            Ok
                        </Button>,
                    ]}
                    destroyOnClose>

                    <Result
                        status="success"
                        title="You have successfully enrolled in this program."
                        subTitle={subTitle} />
                </Modal>
            </>
        );
    }
}
export default EnrollmentModal