import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';

import { Card, Button, Typography, Tag, Table } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { cardHeaderStyle } from '../util/Style';

import SessionReportStore from '../stores/SessionReportStore';
import SessionFilterDrawer from './SessionFilterDrawer';

const { Title } = Typography;
const DATE_PATTERN = 'DD-MMM-YYYY';

@observer
class SessionReport extends Component {

    
    constructor(props) {
        super(props);
        this.store = new SessionReportStore({ apiProxy: props.apiProxy });

        this.state = {
            filteredInfo: null,
            sortedInfo: null,
        };
    }

    componentDidMount() {
        this.store.generateDefaultReport(this.props.programId, this.props.userId);
    }
    
    handleChange = (pagination, filters, sorter) => {
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    };

    displayPeriod = () => {
        const period = this.store.reportPeriod;
        return (
            <Tag key="people" color="rgb(69,49,28)">{period}</Tag>
        )
    }

    showDateFilter = () => {
        this.store.showDrawer = true;
    }

    getDateFilter = () => {
        return (
            <div>
                {this.displayPeriod()}
                <Button key="filter" onClick={this.showDateFilter} type="primary" icon={<FilterOutlined />}>Filter</Button>
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

    getColumns = () => {

        let { sortedInfo, filteredInfo } = this.state;
        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};

        const columns = [
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                width: 50,
                fixed: 'left',
                sorter: (a, b) => moment(a.date,DATE_PATTERN).unix() - moment(b.date,DATE_PATTERN).unix(),
                sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
            },
            {
                title: 'Start Time',
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
                filters: [
                    { text: 'CANCELLED', value: 'CANCELLED' },
                    { text: 'DONE', value: 'DONE' },
                    { text: 'PROGRESS', value: 'PROGRESS' },
                    { text: 'READY', value: 'READY' },
                    { text: 'OVERDUE', value: 'OVERDUE' },
                    { text: 'PLANNED', value: 'PLANNED' }
                ],
                filteredValue: filteredInfo.status || null,
                onFilter: (value, record) => record.status.includes(value),
                ellipsis: true,
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
        
        return columns;
    }

    render() {

        const data = this.store.tableData;
        const columns = this.getColumns();

        return (
            <>
                <Card
                    headStyle={cardHeaderStyle}
                    style={{ borderRadius: "12px" }}
                    extra={this.getDateFilter()}
                    title={<Title level={4}>Report &nbsp;{this.countTag()}</Title>}>
                    <Table bordered size="middle" columns={columns} dataSource={data} onChange={this.handleChange} pagination={{ pageSize: 5 }}/>
                </Card>
                <SessionFilterDrawer programId={this.props.programId} userId={this.props.userId} store={this.store} />
            </>
        )
    }
}

export default SessionReport