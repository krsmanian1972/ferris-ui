import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { PageHeader, Typography, Button, Tooltip, List, Avatar, Tag, Spin } from 'antd';
import { NodeIndexOutlined, PlusCircleOutlined } from '@ant-design/icons';

import PlanDrawer from './PlanDrawer';
import PlanListStore from '../stores/PlanListStore';
import PlanStore from '../stores/PlanStore';

const { Title } = Typography;

@inject("appStore")
@observer
class PlanningUI extends Component {

    constructor(props) {
        super(props);
        this.planListStore = new PlanListStore({ apiProxy: props.appStore.apiProxy });

        this.planStore = new PlanStore({
            apiProxy: props.appStore.apiProxy,
            planListStore: this.planListStore
        });

        this.planListStore.fetchPlans();
    }

    showPlanDetail = (plan) => {
        const params = { plan: { ...plan }, parentKey: "planning" };
        this.props.appStore.currentComponent = { label: "Master Plan", key: "masterPlan", params: params };
    }

    showNewPlan = () => {
        this.planStore.showDrawer = true;
    }

    newPlanButton = () => {
        if (this.props.appStore.isCoach) {
            return (
                <Tooltip key="new_plan_tip" title="Create Plan">
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => this.showNewPlan()}>New Plan</Button>
                </Tooltip>
            )
        }
    }

    countTag = () => {

        if (this.planListStore.isDone) {
            return <Tag color="#108ee9">{this.planListStore.rowCount} Total</Tag>
        }

        if (this.planListStore.isError) {
            return <Tag color="red">...</Tag>
        }

        if (this.planListStore.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }

    render() {
        return (
            <>
                <PageHeader style={{ marginBottom: 5, paddingBottom: 0, paddingTop: 0 }} title={<Title level={3}>Planning {this.countTag()}</Title>}
                    extra={[
                        this.newPlanButton()
                    ]}>

                    <List
                        dataSource={this.planListStore.plans}
                        renderItem={item => (
                            <List.Item key={item.id} style={{ background: "white", borderRadius: 12, color: 'black', marginBottom: 6, cursor: "pointer" }} onClick={() => this.showPlanDetail(item)}>
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: '#87d068', margin: 10 }} icon={<NodeIndexOutlined />} />}
                                    title={item.name}
                                    description={item.description} />
                            </List.Item>
                        )}
                    >
                        {this.planListStore.isLoading && (
                            <div>
                                <Spin />
                            </div>
                        )}
                    </List>
                </PageHeader>

                <PlanDrawer planStore={this.planStore} />
            </>
        )
    }
}
export default PlanningUI