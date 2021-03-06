import React, { Component } from 'react';
import { observer } from 'mobx-react';

import socket from '../stores/socket';
import Editor from "../commons/Editor";

import { Tooltip, Card, Switch,Typography } from 'antd';
import { cardHeaderStyle } from '../util/Style';

const {Title} = Typography;

@observer
class EditableProgramDescription extends Component {

    handleDescription = (text) => {
        this.props.program.description = text;
    }

    renderDescription = () => {

        const program = this.props.program;

        if (this.props.programStore.isReadOnly) {
            return <Editor id="about" value={program.description} readOnly={true} height={300} />
        }

        return (
            <Editor id="about" value={program.description} onChange={this.handleDescription} height={300}/>
        )
    }

    getEditButton = () => {

        if (!this.props.programStore.canEdit) {
            return;
        }

        return (
            <Tooltip key="about_tip" title="Edit to elaborate the potential outcome of this program. Save When you are done.">
                <Switch key="about_switch" onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );

    }

    onEdit = (mode) => {

        this.props.programStore.editMode = mode;

        if (mode) {
            return;
        }

        const program = this.props.program;

        socket.emit(
            'programContent', {
            content: program.description,
            fuzzyId: program.parentProgramId,
            name: 'about.html'
            }
        );
    }

    render() {

        return (
            <Card
                headStyle = {cardHeaderStyle} 
                style={{ borderRadius: "12px",marginTop: "10px" }} 
                title={<Title level={4}>About</Title>} extra={this.getEditButton()}>
                {this.renderDescription()}
            </Card>
        );

    }
}
export default EditableProgramDescription;