import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import { LoadingOutlined, MessageOutlined, StopTwoTone, SyncOutlined } from '@ant-design/icons';

const normal_style = { color: "white", background: "green" };
const crowded_style = { color: "white", background: "blue" };

@observer
class MessageButton extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.appStore.feedStore;
    }

    componentDidMount() {
        this.store.startPolling();
    }

    showPendingFeeds = () => {
        const params = { parentKey: "messageButton" };
        this.props.appStore.currentComponent = { label: "Digest", key: "digest", params: params };
    }

    renderButton = () => {
        if (this.store.isInit) {
            return <SyncOutlined spin/>
        }

        if(this.store.isError) {
            return <StopTwoTone spin twoToneColor="red"/>
        }

        if(this.store.isLoading) {
            return <LoadingOutlined spin/>
        }

        const feedCount = this.store.feedCount;

        if(feedCount === 0) {
            return <Button icon={<MessageOutlined />} onClick={this.showPendingFeeds}/>
        }

        const style = feedCount > 9 ? crowded_style : normal_style;

        return <Button icon={<MessageOutlined />} onClick={this.showPendingFeeds} style={style}>&nbsp;{feedCount}</Button>
    }

    render() {
    
        return (
            <>
                {this.renderButton()}
            </>
        )
    }
}
export default MessageButton;