import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer,Typography } from 'antd';
import ScheduleForm from './ScheduleForm';

const { Text } = Typography;

const info = "You can invite a list of enrolled members of this program after you create this schedule.";

@observer
class ScheduleDrawer extends Component {

    close = () => {
        const store = this.props.sessionStore;
        store.showDrawer = false;
    }

    getInfo = () => {
        return (
            <>
                <Text strong>Note: </Text>
                <Text>{info}</Text>
            </>
        )
    }

    render() {
        const store = this.props.sessionStore;
        const title = store.sessionType === "mono" ? "New One-on-One Session" : "New Conference Scheduling";
        
        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showDrawer} destroyOnClose>
                <ScheduleForm sessionStore = {store} programId = {this.props.programId} memberId={this.props.memberId}/>
                {store.sessionType === "multi" && this.getInfo()}
            </Drawer>
        );
    }
}
export default ScheduleDrawer