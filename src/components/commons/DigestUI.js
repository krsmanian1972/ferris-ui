import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { PageHeader } from 'antd';

import { pageHeaderStyle, pageTitle } from '../util/Style';

import DigestList from './DigestList';


@inject("appStore")
@observer
class DigestUI extends Component {

    constructor(props) {
        super(props);
        this.store = props.appStore.feedStore;
    }

    showJournalUI = (feed) => {

        const journalContext = {
            programId: feed.programId,
            programName: feed.programName,
            coachName: feed.coachName,
            coachId: feed.coachId,
            memberName: feed.memberName,
            memberId: feed.memberId,
            enrollmentId: feed.enrollmentId,
        };

        const params = { journalContext: { ...journalContext }, parentKey: "enrollmentUI" };

        this.props.appStore.currentComponent = { label: "Journal", key: "journal", params: params };
    }

    componentDidMount() {
        this.store.fetchPendingFeeds();
    }

    render() {
        return (
            <PageHeader
                style={pageHeaderStyle}
                title={pageTitle("Digest")}>
                <DigestList store={this.store} showJournalUI={this.showJournalUI}/>
            </PageHeader>
        )
    }
}

export default DigestUI;