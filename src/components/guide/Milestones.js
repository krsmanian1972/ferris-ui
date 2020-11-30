import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tooltip, Card, Switch,Typography } from 'antd';

import socket from '../stores/socket';
import Editor from "../commons/Editor";

import { assetHost } from '../stores/APIEndpoints';
import { cardHeaderStyle } from '../util/Style';

const {Title} = Typography;

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
            at: INIT,
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {

        this.setState({ at: PENDING });
        const program = this.props.program;
        const ver = new Date().getTime();

        try {
            const url = `${assetHost}/programs/${program.parentProgramId}/about/milestones.html?nocache=${ver}`;
            const response = await this.props.apiProxy.getAsync(url);
            if (response.status === 404) {
                this.setState({ at: DONE });
                return;
            }
            this.milestones = await response.text();
            this.setState({ at: DONE });
        }
        catch (e) {
            this.setState({ at: ERROR });
        }
    }

    handleText = (text) => {
        this.milestones = text;
    }

    renderDescription = () => {

        if(this.state.editMode) {
            return <Editor id="milestones" value={this.milestones} onChange={this.handleText} height={300}/>
        }

        return (
             <Editor id="milestones" value={this.milestones} readOnly={true} height={300}/>
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
            content: this.milestones,
            fuzzyId: program.parentProgramId,
            name: 'milestones.html'
            }
        );
    }

    render() {

        return (
            <Card 
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px",marginTop: "10px" }} 
                title={<Title level={4}>Milestones</Title>} extra={this.getEditButton()}>
                <Card.Meta description="The milestones represent the high-level overview of the program. The actual coaching plan will be customized, based on the context of the enrolled member of this program. Of course, the coaching plan will be aligned continuously." style={{ marginBottom: 10, paddingBottom: 10 }} />
                {this.renderDescription()}
            </Card>
        );

    }
}