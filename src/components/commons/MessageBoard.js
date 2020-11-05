import React, { Component } from 'react';
import { observer } from 'mobx-react';

import DiscussionStore from '../stores/DiscussionStore';
import DiscussionList from './DiscussionList';
import DiscussionForm from './DiscussionForm';


@observer
class MessageBoard extends Component {

    constructor(props) {
        super(props);
        this.journalContext = props.journalContext;
        this.store = new DiscussionStore({ apiProxy: props.apiProxy })
    }

    componentDidMount() {
        this.store.fetchDiscussions(this.journalContext.enrollmentId);
    }

    render() {
        return (
            <div>
                <div className="discussion-container">
                    <DiscussionList store={this.store} />
                    <DiscussionForm store={this.store} />
                </div>
            </div>
        )
    }
}

export default MessageBoard;