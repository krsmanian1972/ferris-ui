import React, { Component } from 'react';
import { observer } from 'mobx-react';

import socket from '../stores/socket';
import Editor from "../commons/Editor";

import { Tooltip, Card, Switch } from 'antd';

@observer
export default class EditableProgramDescription extends Component {

    constructor(props) {
        super(props);
    }

    handleDescription = (text) => {
        this.props.program.description = text;
    }

    renderDescription = () => {

        const program = this.props.program;

        if (this.props.programStore.isReadOnly) {
            return <Editor value={program.description} readOnly={true} />
        }

        return (
            <Editor value={program.description} onChange={this.handleDescription} />
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
            fuzzyId: program.fuzzyId,
            name: 'about.html'
            }
        );
    }

    render() {

        return (
            <Card title="About" extra={this.getEditButton()}>
                {this.renderDescription()}
            </Card>
        );

    }
}