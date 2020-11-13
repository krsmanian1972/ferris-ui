import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { PageHeader, Tag } from 'antd';

import { pageHeaderStyle, pageTitle } from '../util/Style';

import DiscussionStore from '../stores/DiscussionStore';
import DiscussionList from './DiscussionList';
import DiscussionForm from './DiscussionForm';

const containerStyle = {
    height: window.innerHeight * 0.75,
};

@inject("appStore")
@observer
class DiscussionUI extends Component {

    constructor(props) {
        super(props);
        this.journalContext = props.params.journalContext;
        
        this.store = new DiscussionStore({ 
            apiProxy: props.appStore.apiProxy,
            feedStore: props.appStore.feedStore
         })
    }

    componentDidMount() {
        this.store.fetchDiscussions(this.journalContext);
    }

    showPeople = () => {
        const people = `${this.journalContext.coachName}`;
        return (
            <Tag key="people" color="rgb(69,49,28)">Discussion With {people}</Tag>
        )
    }

    render() {
        return (
            <PageHeader
                style={pageHeaderStyle}
                title={pageTitle(this.journalContext.programName)}
                extra={[
                    this.showPeople()
                ]}>
                <div style={containerStyle}>
                    <div className="discussion-container">
                        <DiscussionList store={this.store} />
                        <DiscussionForm store={this.store} />
                    </div>
                </div>
            </PageHeader>
        )
    }
}

export default DiscussionUI;