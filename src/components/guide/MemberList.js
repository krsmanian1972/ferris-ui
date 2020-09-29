import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { PageHeader, Typography, Result, Spin } from 'antd';

import MemberListStore from '../stores/MemberListStore';
import MemberSlot from './MemberSlot';

const { Title } = Typography;

@inject("appStore")
@observer
class MemberList extends Component {

    constructor(props) {
        super(props);
        this.store = new MemberListStore({ apiProxy: props.appStore.apiProxy });
    }

    componentDidMount() {
        this.store.fetchMembers();
    }

    render() {

        return (
            <>
                <PageHeader style={{ marginBottom: 5, paddingBottom: 0, paddingTop: 0 }} title={<Title level={3}>Enrollments</Title>} />
                {this.renderList()}
            </>
        )
    }

    renderList = () => {

        if (this.store.isLoading) {
            return (
                <div className="loading-container"><Spin /></div>
            )
        }

        if (this.store.isError) {
            return (
                <Result status="warning" title={this.store.message.help} />
            )
        }

        return this.renderMembers();
    }

    renderMembers = () => {
        const members = this.store.members;
        const elements = [];
        if (members) {
            var index = 0
            for (let [email, details] of members) {
                elements.push(<MemberSlot key={index++} email={email} details={details} />);
            }
        }

        return (
            <>{elements}</>
        )
    }
}

export default MemberList