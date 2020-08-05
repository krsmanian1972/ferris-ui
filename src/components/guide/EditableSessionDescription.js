import React, { Component } from 'react';
import { Tooltip, Switch } from 'antd';

import socket from '../stores/socket';
import Editor from "../commons/Editor";

import { assetHost } from '../stores/APIEndpoints';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

/**
 * props: sessionUserFuzzyId,sectionTitle and title
 * 
 */
export default class EditableDescription extends Component {

    constructor(props) {
        super(props);

        this.description="";

        this.state = {
            editMode: false,
            state:INIT,
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async() => {
        
        this.setState({ state: PENDING });

        try {
            const url = `${assetHost}/contents/${this.props.sessionUserFuzzyId}/${this.props.boardId}`;
            const response = await this.props.apiProxy.getAsync(url);
            if(response.status === 404) {
                this.setState({ state: DONE });
                return;
            }
            this.description = await response.text();
            this.setState({ state: DONE });
        }
        catch (e) {
            this.setState({ state: ERROR });
        }
    }

    handleDescription = (text) => {
        this.description = text;
    }

    renderDescription = () => {
        if (this.state === PENDING || this.state === INIT) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.state === ERROR) {
            return (
                <Result status="warning" title={store.message.help} />
            )
        }

        if (!this.state.editMode) {
            return <Editor id={this.props.title} value={this.description} readOnly={true} />
        }
        return (
            <Editor id={this.props.title} value={this.description} onChange={this.handleDescription} />
        )
    }

    getTitle = () => {
        return (
            <p style={{marginTop:5,marginLeft:10,fontWeight:"bold"}}>{this.props.title}</p>
        )
    }
    getEditButton = () => {
        return (
            <Tooltip key="ed_tip" title="To elaborate this section">
                <Switch key="ed_switch" style={{marginTop:5,marginRight:10}} onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );
    }

    onEdit = (mode) => {

        this.setState({ editMode: mode });

        if (mode) {
            return;
        }

        socket.emit(
            'sessionContent', {
            content: this.description,
            sessionUserFuzzyId: this.props.sessionUserFuzzyId,
            fileName: this.props.fileName
        });
    }

    render() {
        return (
            <div style={{border:"1px solid lightgray",minHeight:250,width:"50%",marginRight:2,marginBottom:4}}>
                <div style={{display:"flex",flexDirection:"row",justifyContent: "space-between",background:"lightgray"}}>
                    {this.getTitle()}
                    {this.getEditButton()}
                </div>
                {this.renderDescription()}
            </div>
        );
    }
}