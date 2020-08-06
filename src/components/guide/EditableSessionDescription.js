import React, { Component } from 'react';
import { Tooltip, Switch, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

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

        this.description = "";

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

        try {
            const url = `${assetHost}/contents/${this.props.sessionUserFuzzyId}/${this.props.boardId}`;
            const response = await this.props.apiProxy.getAsync(url);
            if (response.status === 404) {
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
            return <Editor id={this.props.title} value={this.description} readOnly={true} height={350} />
        }
        return (
            <Editor id={this.props.title} value={this.description} onChange={this.handleDescription} height={350} />
        )
    }

    getTitle = () => {
        return (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, fontWeight: "bold" }}> {this.props.title} </div>
        )
    }
    getControls = () => {
        return (
            <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
                {this.props.type === "action" && (
                    <Tag color="blue">10-Sep-2020</Tag>
                )}
                <Space>
                    <Tooltip key="ed_tip" title="To elaborate this section">
                        <Switch key="ed_switch" onClick={this.onEdit} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
                    </Tooltip>
                    <Tooltip key="add_tip" title="To Add New Item">
                        <Button key="add_tip" icon={<PlusOutlined />} shape="circle"></Button>
                    </Tooltip>
                </Space>
            </div>
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
            <div style={{ border: "1px solid lightgray", marginRight: 4, marginBottom: 4, width: "100%",borderRadius:"4%" }}>
                <div style={{ display: "flex", flexWrap: "wrap", height: 50, flexDirection: "row", justifyContent: "space-between" }}>
                    {this.getTitle()}
                    {this.getControls()}
                </div>
                {this.renderDescription()}
            </div>
        );
    }
}