import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import Moment from 'react-moment';
import 'moment-timezone';

import { Steps, Statistic, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, LikeOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { Countdown } = Statistic;
const { Title } = Typography;

const indicatorStyle = { display: "flex", flexDirection: "column", width: "20%", textAlign: "left" };
const planStyle = { display: "flex", flexDirection: "column", textAlign: "center", width: "20%" };
const progressStyle = { textAlign: "center", width: "50%" };
const createdAtStyle = { display: "flex", flexDirection: "column", width: "10%", textAlign: "right" };

const indBlue = { fontSize: "12px", fontWeight: "bold", color: "green" };

const valueStyle = { fontSize: "12px", fontWeight: "bold" };
const labelStyle = { fontSize: "10px", textAlign: "right" };
const dateStyle = { display: "flex", flexDirection: "column", fontSize: 12, fontWeight: "bold" };

export default function ActionState({ task }) {

    const createdOn = () => {
        const title = <Title level={5} style={labelStyle}>Created On</Title>
        const createdAt = moment(task.createdAt * 1000).format("DD-MMM-YYYY");
        return (
            <div style={createdAtStyle}>
                <Statistic title={title} value={createdAt} valueStyle={valueStyle} />
            </div>
        )
    }

    const dateEl = (rustDate) => {
        const dt = moment(rustDate * 1000);
        return (
            <div style={dateStyle}>
                <Moment format="DD-MMM-YYYY">{dt}</Moment>
                <Moment format="hh:mm A">{dt}</Moment>
            </div>
        )
    }

    const plan = () => {
        return (
            <div style={planStyle}>
                <Title level={5} style={{ fontSize: 10 }}>Planned To Complete</Title>
                {dateEl(task.scheduleEnd)}
            </div>
        )
    }

    const progress = () => {

        const plannedEl = task.scheduleStart ? dateEl(task.scheduleStart) : ""
        const startEl = task.actualStart ? dateEl(task.actualStart) : "Awaiting"
        const respEl = task.respondedDate ? dateEl(task.respondedDate) : "Awaiting"
        const doneEl = task.actualEnd ? dateEl(task.actualEnd) : "Awaiting"

        var stage = 0;
        if (task.actualStart) stage = 1;
        if (task.respondedDate) stage = 2;
        if (task.actualEnd) stage = 3;

        return (
            <div style={progressStyle}>
                <Steps labelPlacement="vertical" current={stage} size="small">
                    <Step title={plannedEl} description="Planned Start" />
                    <Step title={startEl} description="Actual Start" />
                    <Step title={respEl} description="Responded" />
                    <Step title={doneEl} description="Closure" />
                </Steps>
            </div>
        )
    }

    const indicator = () => {

        if (task.actualEnd) {
            const actualEnd = moment(task.actualEnd * 1000).format("DD-MMM-YYYY");
            return (
                <Statistic title="Closed On" value={actualEnd} valueStyle={indBlue} prefix={<LikeOutlined />} />
            )
        }

        if (task.respondedDate) {
            const respondedDate = moment(task.respondedDate * 1000);
            const diff = respondedDate.diff(moment(), 'hours');
            return (
                <Statistic title="Awaiting Closure" value={diff * (-1)} precision={0} valueStyle={{ color: '#cf1322' }} prefix={<ArrowDownOutlined />} suffix="hours" />
            )
        }

        const localeEnd = moment(task.scheduleEnd * 1000);
        const diff = localeEnd.diff(moment(), 'hours');
        if (diff >= 0) {
            return <Countdown title="Hours Ahead" value={localeEnd} format="HH:mm" valueStyle={{ color: 'green' }} prefix={<ArrowUpOutlined />} suffix="hours" />
        }
        return <Statistic title="Overdue" value={diff * (-1)} precision={0} valueStyle={{ color: '#cf1322' }} prefix={<ArrowDownOutlined />} suffix="hours" />
    }

    return (
        <div className="task-stat">
            <div style={indicatorStyle}>{indicator()}</div>
            {progress()}
            {plan()}
            {createdOn()}
        </div>
    )
};

ActionState.propTypes = {
    task: PropTypes.object,
};

