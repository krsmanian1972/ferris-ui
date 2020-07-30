import React from 'react';
import { observer } from 'mobx-react';

import { Typography, Button, Tooltip, Tag,Space,Upload } from 'antd';
import { UploadOutlined, BorderHorizontalOutlined } from '@ant-design/icons';

import { assetHost } from '../stores/APIEndpoints';

import ProgramList from "../commons/ProgramList";

const { Text } = Typography;

@observer
class CoachProgramList extends ProgramList {

    constructor(props) {
        super(props);
        this.state = {imageBorder:"none"}
    }

    /**
     * Cheat the renderer to show the latest image
     */
    onCoverImageChange = () => {
        this.props.programListStore.change = new Date().getTime();
    }

    /**
     * Let the coach to upload the Thumbnail / Cover image. 
     * @param {*} program 
     */
    uploadCover = (program) => {
        const action = `${assetHost}/programs/${program.fuzzyId}/cover`
        const props = {
            name: 'cover.png',
            action: action,
            accept: ".png",
            showUploadList:false
        };

        return (
            <Upload {...props} onChange = {this.onCoverImageChange}>
                <Tooltip title="To Upload or Change the Thumbnail Image of this Program.">
                    <Button icon={<UploadOutlined/>}></Button>
                </Tooltip>    
            </Upload>
        )
    }

    /**
     * Allow the coach to upload a thumbnail image.
     * @param {*} program 
     */
    getName = (program) => {
        if(program.active) {
            return <Text style={{ textAlign: "center" }}>{program.name}</Text>
        }

        return (
            <Space>
                <Tooltip title="This is a Draft Program, pending activation.">
                    <Tag onClick={() => this.props.showProgramDetail(program.fuzzyId)} color="geekblue" style={{ textAlign: "center" }}>{program.name}</Tag>
                </Tooltip>     
                {this.uploadCover(program)}
                {this.guide()}
            </Space>
        )          
    }

     /**
     * Provide a border to assess the fitment of the image in terms of size.
     */
   
    guide = () => {
        return (
            <Tooltip title="A border will be opened to check the fitment of the image.">
                <Button key="guide" onClick={this.toggleGuide} icon={<BorderHorizontalOutlined/>} shape="circle"></Button>
            </Tooltip>
        )
    }

    toggleGuide = () => {
        if(this.state.imageBorder === "none") {
            this.setState({imageBorder:"1px dashed lightgray"})
        }
        else {
            this.setState({imageBorder:"none"})
        }
    }

    /**
     * Override the Cover url with a versioning to avoid caching of images
     * @param {*} program 
     */
    getCoverUrl = (program) => {
        const ver = new Date().getTime();
        const url = `${assetHost}/programs/${program.fuzzyId}/cover/cover.png?nocache=${ver}`;
        return url;
    }
    
}
export default CoachProgramList;