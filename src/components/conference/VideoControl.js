import React, { Component } from 'react';

import { Button, Tooltip, Space} from 'antd';
import { CameraOutlined, AudioOutlined, AudioMutedOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

class VideoControl extends Component {

    constructor(props) {
        super(props);

        this.state = {
            videoDevice: 'On',
            audioDevice: 'On',
        }
    }
    getAudioIcon = () => {
        if (this.state.audioDevice === 'On') {
            return <AudioOutlined />;
        }
        return <AudioMutedOutlined />
    }

    getVideoIcon = () => {
        if (this.state.videoDevice === 'On') {
            return <CameraOutlined />
        }
        return <EyeInvisibleOutlined />;
    }

    getVideoTooltip = () => {
        if (this.state.videoDevice === 'On') {
            return "Turn-off the Camera";
        }
        return "Turn-on the Camera";
    }

    getAudioTooltip = () => {
        if (this.state.audioDevice === 'On') {
            return "Mute the Microphone";
        }
        return "Unmute the Microphone";
    }

    toggleVideoDevice = () => {
		if (this.state.videoDevice === 'On') {
			this.props.callback('video','off');
			this.setState({ videoDevice: 'Off' })
		}
		else {
			this.props.callback('video','on');
			this.setState({ videoDevice: 'On' })
		}
	}

    toggleAudioDevice = () => {
		if (this.state.audioDevice === 'On') {
			this.props.callback('audio','off');
			this.setState({ audioDevice: 'Off' })
		}
		else {
			this.props.callback('audio','on');
			this.setState({ audioDevice: 'On' })
		}
	}

    render() {
        return (
            <div>
                <Space>
                    <Tooltip title={this.getVideoTooltip()}>
                        <Button type="primary" icon={this.getVideoIcon()} shape="circle" onClick={this.toggleVideoDevice} />
                    </Tooltip>
                    <Tooltip title={this.getAudioTooltip()}>
                        <Button type="primary" icon={this.getAudioIcon()} shape="circle" onClick={this.toggleAudioDevice} />
                    </Tooltip>
                </Space>
            </div>
        )
    }
}

export default VideoControl;