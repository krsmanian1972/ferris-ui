import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, List, Card, Typography, Radio, Tooltip, Tag,Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import EnrollmentListStore from "../stores/EnrollmentListStore";

const { Title } = Typography;

const NEW = "NEW";
const ALL = "ALL";

@inject("appStore")
@observer
class EnrollmentList extends Component {

    constructor(props) {
        super(props);
        this.state= {desire: NEW};
        
        this.store = new EnrollmentListStore({ apiProxy: props.appStore.apiProxy });
        this.store.fetchEnrollments(props.programId, this.state.desire);
    }

    onChange = (e) => {
        const desire = e.target.value;
        this.setState({desire: desire});
        this.store.fetchEnrollments(this.props.programId, desire);
    }

    getEnrollmentOptions = () => {
        return (
            <Tooltip key="enrollment_tip" title="Shows the list of Enrollments.">
                <Radio.Group onChange={this.onChange} value={this.state.desire}>
                    <Radio value={NEW}>NEW</Radio>
                    <Radio value={ALL}>ALL</Radio>
                </Radio.Group>      
            </Tooltip>
        );
    }

    countTag = () => {
        
        if (this.store.isDone) {
            return <Tag color="#108ee9">{this.store.rowCount} Total</Tag>
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }

        if (this.store.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    render() {
        return(
            <Card title={<Title level={4}>Enrollments {this.countTag()}</Title>} extra={this.getEnrollmentOptions()}>
                
                <List
                    dataSource={this.store.members}
                    renderItem={item => (
                        <List.Item key={item.id}>
                            <List.Item.Meta 
                                avatar={<Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />}/>}
                                title={item.name} 
                                description={item.email}/>
                        </List.Item>
                        )}
                    >
                    {this.store.isLoading && (
                    <div>
                        <Spin />
                    </div>
                    )}
                </List>

          </Card>
        )
    }

}

export default EnrollmentList;