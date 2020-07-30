import React, { Component } from 'react';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { assetHost } from '../stores/APIEndpoints';

class ProgramContentForm extends Component {

    render() {
        const program = this.props.program;
        const posterAction = `${assetHost}/programs/${program.fuzzyId}/poster`

        const props = {
            name: 'poster.png',
            action: posterAction,
            accept: ".png",
            listType: "picture",
        };

        return (
            <Upload {...props} onChange = {this.props.onContentChange}>
                <Button>
                    <UploadOutlined /> Upload Poster
                </Button>
            </Upload>
        );
    }
}
export default ProgramContentForm;