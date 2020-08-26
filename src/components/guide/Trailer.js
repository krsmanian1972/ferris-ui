import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import { Tooltip, Card, Button, Upload, message, Typography, Progress } from 'antd';

import { assetHost } from '../stores/APIEndpoints';
import { BuildOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default class Trailer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            percent: 0,
            showTrailer: true,
        }
    }

    /**
     * Let the coach to upload the Trailer
     *  
    */
    getTrailerButton = () => {
        if (!this.props.canEdit) {
            return;
        }

        const action = `${assetHost}/programs/${this.props.program_id}/trailer`

        const props = {
            name: 'trailer.mp4',
            action: action,
            accept: ".mp4",
            showUploadList: false
        };

        return (
            <Upload key="trailer_upload" {...props} onChange={this.onUpload}>
                <Tooltip key="trailer_tp" title="To Upload or Change the Trailer of this Program.">
                    <Button key="trailer_button" disabled={!this.state.showTrailer} type="primary" icon={<BuildOutlined />}>Trailer</Button>
                </Tooltip>
            </Upload>
        )
    }

    onUpload = (info) => {

        if (info.event) {
            const percent = parseFloat(info.event.percent.toFixed(2));
            this.setState({ showTrailer: false, percent: percent });
        }

        if (info.file.status === 'done') {
            this.setState({ showTrailer: true })
            message.success(`${info.file.name} file uploaded successfully`);

        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    renderProgress = () => {
        if (!this.state.showTrailer) {
            return (
                <>
                    <Progress percent={this.state.percent} />
                    <p>Please wait...</p>
                </>
            )
        }
    }

    renderTrailer = () => {
        if (this.state.showTrailer) {
            const ver = new Date().getTime();
            const url = `${assetHost}/programs/${this.props.program_id}/trailer/trailer.mp4?nocache=${ver}`;
            return (
                <div className='trailer-wrapper'>
                    <ReactPlayer width='100%' height='100%' controls className='trailer' url={url} />
                </div>
            )
        }
    }

    render() {
        return (
            <Card style={{ borderRadius: "12px", marginTop: "10px" }} title={<Title level={4}>Trailer</Title>} extra={this.getTrailerButton()}>
                {this.renderProgress()}
                {this.renderTrailer()}
            </Card>
        )
    }
}