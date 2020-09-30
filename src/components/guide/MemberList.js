import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Typography, Tag } from 'antd';

import MemberSlot from './MemberSlot';

const { Title } = Typography;

@observer
class MemberList extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.store.fetchMembers();
    }

    getTitle = () => {
        return (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}>
                Members&nbsp;{this.countTag()}
            </div>
        )
    }

    countTag = () => {
        if (this.props.store.isDone) {
            return <Tag color="#108ee9">{this.props.store.rowCount} Total</Tag>
        }

        if (this.props.store.isError) {
            return <Tag color="red">...</Tag>
        }
    }

    render() {

        const members = this.props.store.members;

        return (
            <div style={{ width: "50%", marginRight: "10px" }}>
                <div style={{ background: "rgb(59,109,171)", marginBottom: "6px", color: "white", display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                    {this.getTitle()}
                </div>
                {this.displayMessage()}
                {this.renderMembers(members)}
            </div>
        )
    }

    displayMessage = () => {
        const store = this.props.store;

        if (store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (store.isError) {
            return (
                <Result status="warning" title={store.message.help} />
            )
        }

        return (<></>)
    }

    renderMembers = (members) => {
        const elements = [];
        if (members) {
            var index = 0
            for (let [email, details] of members) {
                elements.push(<MemberSlot key={index++} email={email} details={details} showMemberSessions={this.props.showMemberSessions} />);
            }
        }

        return (
            <>{elements}</>
        )
    }
}

export default MemberList