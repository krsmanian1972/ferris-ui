import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result } from 'antd';

import DigestSlot from './DigestSlot';
import { SmileOutlined } from '@ant-design/icons';

@observer
class DigestList extends Component {

    componentDidMount() {
        this.props.store.fetchPendingFeeds();
    }

    
    render() {

        const feeds = this.props.store.feeds;

        return (
            <div style={{ marginRight: "10px" }}>
                {this.displayMessage()}
                {this.renderFeeds(feeds)}
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

    renderFeeds = (feeds) => {
        const elements = [];
        var index = 0;
        if (feeds) {
            for (let [email, details] of feeds) {
                elements.push(<DigestSlot key={index++} email={email} details={details}  showJournalUI={this.props.showJournalUI}/>);
            }
        }

        if(elements.length === 0) {
            return <Result 
                icon={<SmileOutlined />}
                title="Your message board is clean"
                subTitle="You do not have any unread or pending messages."
            />
        }

        return (<>{elements}</>)
    }
}

export default DigestList