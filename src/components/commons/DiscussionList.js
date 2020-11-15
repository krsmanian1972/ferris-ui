import React, { Component, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';

import { Result, Spin } from 'antd';

const VerticalRider = () => {
    const riderRef = useRef();
    useEffect(() => riderRef.current.scrollIntoView());
    return <div ref={riderRef} />;
};

@observer
class DiscussionList extends Component {
    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
    
    }

    render() {
        const store = this.props.store;

        if (store.isLoading) {
            return (
                <div className="loading-container"><Spin /></div>
            )
        }

        if (store.isError) {
            return (
                <Result status="warning" title={store.message.help} />
            )
        }

        return (this.renderDiscussions());
    }

    renderMyChat = (item, index) => {

        const key = `chat_1_${index}`;
        const key1 = `chat_1_${index}`;
        const key2 = `chat_2_${index}`;

        return (
            <div key={key} className="chat-item">
                <div key={key1} style={{ width: "60%" }} />
                <div key={key2} className="my-chat">
                    <div className="chat-stamp">
                        <p className="chat-date">{item.date}</p>
                        <p className="chat-who">Me</p>
                    </div>
                    <p className="chat-content">{item.description}</p>
                </div>
            </div>
        )
    }

    renderPeerChat = (item, index) => {

        const key = `chat_1_${index}`;
        const key1 = `chat_1_${index}`;
        const key2 = `chat_2_${index}`;

        return (
            <div key={key} className="chat-item">
                <div key={key2} className="other-chat">
                    <p className="chat-date" style={{color:"blue"}}>{item.date}</p>
                    <p className="chat-content">{item.description}</p>
                </div>
                <div key={key1} style={{ width: "60%" }} />
            </div>
        )
    }

    renderDiscussions = () => {

        const discussions = this.props.store.discussions;

        return (
            <div className="discussion-list">
                {
                    discussions && discussions.map((item, index) => {
                        if (item.by === 'me') {
                            return this.renderMyChat(item, index);
                        }
                        else {
                            return this.renderPeerChat(item,index);
                        }

                    })
                }
                <VerticalRider />
            </div>
        )
    }
}
export default DiscussionList;
