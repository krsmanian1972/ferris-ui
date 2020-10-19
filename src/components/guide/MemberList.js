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

    
    render() {

        const members = this.props.store.members;

        return (
            <div style={{ marginRight: "10px" }}>
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
                elements.push(<MemberSlot key={index++} email={email} details={details} showJournalUI={this.props.showJournalUI} />);
            }
        }

        return (
            <>{elements}</>
        )
    }
}

export default MemberList