import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Moment from 'react-moment';
import 'moment-timezone';

import { Typography, Tag, Table } from 'antd';

const { Text, Title } = Typography;

const nameStyle = { color: "rgb(59,109,171)", cursor: "pointer" };
const titleStyle = { color: "rgb(59,109,171)", textAlign: "center" };
const dateStyle = { display: "flex", flexDirection: "column", fontSize: 10, fontWeight: "bold" };


const status_filter = [
    { text: 'CANCELLED', value: 'CANCELLED' },
    { text: 'DONE', value: 'DONE' },
    { text: 'DUE', value: 'DUE' },
    { text: 'DELAY', value: 'DELAY' },
    { text: 'RESPONDED', value: 'RESPONDED' },
    { text: 'PROGRESS', value: 'PROGRESS' },
    { text: 'PLANNED', value: 'PLANNED' }
]

const status_color = {
    "CANCELLED": "black",
    "DONE": "#87d068",
    "DUE": "#f50",
    "DELAY": "#f50",
    "RESPONDED": "geekblue",
    "PROGRESS": "#ffa500",
    "PLANNED": "blue"
};

@observer
class ActionSummary extends Component {

    constructor(props) {
        super(props);
        this.store = props.store;

        this.state = {
            filteredInfo: null,
            sortedInfo: null,
        };
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    };

    renderName = (text, record, index) => {

        return (
            <Text style={nameStyle} key={text} onClick={() => this.props.slideTo(record.key)}>
                {text}
            </Text>
        )
    }

    renderStatus = (text, record, index) => {

        let color = status_color[text];

        if (!color) {
            color = "blue";
        }

        return (
            <Tag color={color} style={{ cursor: "pointer" }} key={text} onClick={() => this.props.slideTo(record.key)}>
                {text}
            </Tag>
        )
    }

    renderDateTime = (text, record, index) => {
        if (!text) {
            return (
                <div key={index} style={dateStyle}>-</div>
            )
        }
        return (
            <div key={index} style={dateStyle}>
                <Moment format="DD-MMM-YYYY">{text}</Moment>
                <Moment format="hh:mm A">{text}</Moment>
            </div>
        )
    }


    getColumns = () => {

        let { sortedInfo, filteredInfo } = this.state;
        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};

        const columns = [
            {
                title: 'Activity',
                dataIndex: 'name',
                key: 'name',
                width: 50,
                fixed: 'left',
                render: this.renderName,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 30,
                fixed: 'left',
                filters: status_filter,
                filteredValue: filteredInfo.status || null,
                onFilter: (value, record) => record.status.includes(value),
                render: this.renderStatus
            },
            {
                title: 'Hours Spent',
                key: 'duration_comp',
                children: [
                    {
                        title: 'Planned',
                        dataIndex: 'duration',
                        key: 'duration',
                        width: 25,
                        align: 'right',
                        fixed: 'left',
                    },
                    {
                        title: 'Actual',
                        dataIndex: 'actualDuration',
                        key: 'actualDuration',
                        width: 25,
                        align: 'right',
                        fixed: 'left',
                    },
                ]
            },
            {
                title: 'Planned',
                key: 'planned',
                children: [
                    {
                        title: 'Start',
                        dataIndex: 'scheduleStart',
                        key: 'scheduleStart',
                        width: 35,
                        render: this.renderDateTime,
                        sorter: (a, b) => a.scheduleStart - b.scheduleStart,
                        sortOrder: sortedInfo.columnKey === 'scheduleStart' && sortedInfo.order,
                    },
                    {
                        title: 'End',
                        dataIndex: 'scheduleEnd',
                        key: 'scheduleEnd',
                        width: 35,
                        render: this.renderDateTime,
                        sorter: (a, b) => a.scheduleEnd - b.scheduleEnd,
                        sortOrder: sortedInfo.columnKey === 'scheduleEnd' && sortedInfo.order,
                    },
                ]
            },
            {
                title: 'Actual Execution',
                key: 'execution',
                children: [
                    {
                        title: 'Start',
                        dataIndex: 'actualStart',
                        key: 'actualStart',
                        width: 35,
                        render: this.renderDateTime,
                        sorter: (a, b) => a.actualStart - b.actualStart,
                        sortOrder: sortedInfo.columnKey === 'actualStart' && sortedInfo.order,
                    },
                    {
                        title: 'End',
                        dataIndex: 'respondedDate',
                        key: 'respondedDate',
                        width: 35,
                        render: this.renderDateTime,
                        sorter: (a, b) => a.respondedDate - b.respondedDate,
                        sortOrder: sortedInfo.columnKey === 'respondedDate' && sortedInfo.order,
                    },
                ]
            },
            {
                title: 'Closed On',
                dataIndex: 'actualEnd',
                key: 'actualEnd',
                width: 35,
                render: this.renderDateTime,
                sorter: (a, b) => a.actualEnd - b.actualEnd,
                sortOrder: sortedInfo.columnKey === 'actualEnd' && sortedInfo.order,
            }
        ];

        return columns;
    }

    render() {

        const data = this.store.tasks;
        const columns = this.getColumns();

        return (
            <div style={{ marginTop: 10 }}>
                <Title style={titleStyle} level={5}>Execution Summary</Title>
                <Table key="task_summary" bordered size="small" columns={columns} dataSource={data} onChange={this.handleChange} pagination={{ pageSize: 5 }} scroll={{ x: 900, y: 600 }} />
            </div>
        )
    }
}

export default ActionSummary