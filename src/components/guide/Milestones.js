import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tooltip, Card, Switch } from 'antd';

import socket from '../stores/socket';
import Editor from "../commons/Editor";

import { assetHost } from '../stores/APIEndpoints';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

@observer
export default class Milestones extends Component {

    constructor(props) {
        super(props);

        this.milestones = "";

        this.state = {
            editMode: false,
            state: INIT,
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {

        this.setState({ state: PENDING });
        const program = this.props.program;

        try {
            const url = `${assetHost}/programs/${program.id}/about/milestones.html`;
            const response = await this.props.apiProxy.getAsync(url);
            if (response.status === 404) {
                this.setState({ state: DONE });
                return;
            }
            this.milestones = await response.text();
            this.setState({ state: DONE });
        }
        catch (e) {
            this.setState({ state: ERROR });
        }
    }

    handleText = (text) => {
        this.milestones = text;
    }

    renderDescription = () => {

        if(this.state.editMode) {
            <Editor id="milestones" value={this.milestones} onChange={this.handleText} />
        }

        return (
             <Editor id="milestones" value={this.milestones} readOnly={true} />
        )
    }

    getEditButton = () => {

        if (!this.props.programStore.canEdit) {
            return;
        }

        return (
            <Tooltip key="milestone_tip" title="Edit to describe the milestones of this program.">
                <Switch key="milestone_switch" onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );

    }

    onEdit = (mode) => {

        this.setState({ editMode: mode });

        if (mode) {
            return;
        }

        const program = this.props.program;

        socket.emit(
            'programContent', {
            content: this.description,
            fuzzyId: program.id,
            name: 'milestones.html'
            }
        );
    }

    render() {

        return (
            <Card title="Milestones" extra={this.getEditButton()}>
                <Card.Meta description="The milestones represent the high-level overview of the program. The actual coaching plan will be customized, based on the context of the enrolled member of this program. Of course, the coaching plan will be aligned continuously." style={{ marginBottom: 10, paddingBottom: 10 }} />
                {this.renderDescription()}
            </Card>
        );

    }
}