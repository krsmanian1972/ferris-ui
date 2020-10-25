import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Card, Button, Typography, Tag, Table } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { cardHeaderStyle } from '../util/Style';

import SessionReportStore from '../stores/SessionReportStore';
import SessionFilterDrawer from './SessionFilterDrawer';

const { Title } = Typography;

const columns = [
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        width: 50,
        fixed: 'left',
    },
    {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        width: 50,
        fixed: 'left',
    },
    {
        title: 'Session Name',
        dataIndex: 'sessionName',
        key: 'sessionName',
        width: 100,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 50,
    },
    {
        title: 'Duration (min)',
        children: [
            {
                title: 'Planned',
                dataIndex: 'plannedDuration',
                key: 'planned',
                width: 50,
                align: 'right'
            },
            {
                title: 'Actual',
                dataIndex: 'actualDuration',
                key: 'actual',
                width: 50,
                align: 'right'
            },
        ]
    }
];

@observer
class SessionReport extends Component {

    constructor(props) {
        super(props);
        this.store = new SessionReportStore({ apiProxy: props.apiProxy });
    }

    componentDidMount() {
        this.store.generateDefaultReport(this.props.programId, this.props.userId);
    }

    displayPeriod = () => {
        const period = this.store.reportPeriod;
        return (
            <Tag key="people" color="rgb(69,49,28)">{period}</Tag>
        )
    }

    showFilter = () => {
        this.store.showDrawer = true;
    }

    getFilters = () => {
        return (
            <div>
                {this.displayPeriod()}
                <Button key="filter" onClick={this.showFilter} type="primary" icon={<FilterOutlined />}>Filter</Button>
            </div>
        )
    }

    countTag = () => {
        const store = this.store;

        if (store.isDone) {
            return <Tag color="#108ee9">{store.rowCount} Total</Tag>
        }

        if (store.isError) {
            return <Tag color="red">...</Tag>
        }

        if (store.isLoading) {
            return <Tag color="blue">...</Tag>
        }
    }


    render() {

        const data = this.store.tableData;

        return (
            <>
                <Card
                    headStyle={cardHeaderStyle}
                    style={{ borderRadius: "12px" }}
                    extra={this.getFilters()}
                    title={<Title level={4}>Report &nbsp;{this.countTag()}</Title>}>
                    <Table bordered columns={columns} dataSource={data} />
                </Card>
                <SessionFilterDrawer programId={this.props.programId} userId={this.props.userId} store={this.store} />
            </>
        )
    }
}

export default SessionReport