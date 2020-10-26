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
export default class AboutMentor extends Component {
    constructor(props) {
        super(props);

        this.about = "";

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
            const url = `${assetHost}/programs/${program.id}/about/coach.html?nocache=${ver}`;
            const response = await this.props.apiProxy.getAsync(url);
            if (response.status === 404) {
                this.setState({ at: DONE });
                return;
            }
            this.about = await response.text();
            this.setState({ at: DONE });
        }
        catch (e) {
            this.setState({ at: ERROR });
        }
    }

    getEditButton = () => {

        if (!this.props.programStore.canEdit) {
            return;
        }

        return (
            <Tooltip key="about_coach_tip" title="Edit to describe your profile. You can create a link to your LinkedIn Profile.">
                <Switch key="about_coach_switch" onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
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
            content: this.about,
            fuzzyId: program.id,
            name: 'coach.html'
            }
        );
    }

    handleText = (text) => {
        this.about = text;
    }

    renderDescription = () => {

        if(this.state.editMode) {
            return <Editor id="coach_about" value={this.about} onChange={this.handleText} height={300}/>
        }

        return (
             <Editor id="coach_about" value={this.about} readOnly={true} height={300}/>
        )
    }

    render() {

        return (
            <Card 
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px",marginTop: "10px" }} 
                title={<Title level={4}>About Coach</Title>} extra={this.getEditButton()}>
                {this.renderDescription()}
            </Card>
        );

    }
}