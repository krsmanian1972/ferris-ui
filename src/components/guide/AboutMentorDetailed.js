import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tooltip, Card, Switch,Typography, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { toJS } from 'mobx'

import socket from '../stores/socket';
import Editor from "../commons/Editor";

import { assetHost } from '../stores/APIEndpoints';
import { cardHeaderStyle } from '../util/Style';

const {Title} = Typography;

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';
const DESC_FILE = "description";
const HIST_FILE = "history";
@inject("appStore")
@observer
export default class AboutMentorDetailed extends Component {

    constructor(props) {
        super(props);
        this.apiProxy = this.props.appStore.apiProxy;
        this.isCoach = this.props.appStore.isCoach;
        if(this.isCoach){
            this.coachId = this.apiProxy.getUserFuzzyId();
        }
        else{
            this.coachId = this.props.params.coachContext.coachId;
        }
        this.coachDescription = "";
        this.coachHistory = "";
        this.state = {
            editMode: false,
            at: INIT,
        }
    }

    componentDidMount() {
        this.loadCoachDetails(DESC_FILE);
        this.loadCoachDetails(HIST_FILE);
    }

    loadCoachDetails = async (fileName) => {
        this.fileContent = "";
        this.setState({ at: PENDING });
        const ver = new Date().getTime();

        try {
             const url = `${assetHost}/mentor/${this.coachId}/${fileName}.html?nocache=${ver}`;
             const response = await this.apiProxy.getAsync(url);
             if (response.status === 404) {
                 this.setState({ at: DONE });
                 return;
             }
             if(fileName === DESC_FILE){
                 this.coachDescription = await response.text();
             }
             if(fileName === HIST_FILE){
                 this.coachHistory = await response.text();
             }

             this.setState({ at: DONE });
         }
         catch (e) {
             console.log(e);
             this.setState({ at: ERROR });
        }
        return(this.fileContent);
    }

    getEditDescriptionButton = () => {

      if(!this.isCoach){
        return;
      }

        return (
            <Tooltip key="about_coach_desc" title="Edit Coach Profile">
                <Switch key="about_coach_switch" onClick={this.onEditDescription} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );

    }

    getEditHistoryButton = () => {

        if(!this.isCoach){
          return;
        }

        return (
            <Tooltip key="about_coach_hist" title="Type Some History">
                <Switch key="about_coach_hist" onClick={this.onEditHistory} checkedChildren="Save" unCheckedChildren="Edit" defaultChecked={false} />
            </Tooltip>
        );

    }

    onEditHistory = (mode) => {
        console.log(mode);
        this.setState({ editMode: mode });

        if (mode) {
            return;
        }

        socket.emit(
            'coachContent', {
            content: this.coachHistory,
            fuzzyId: this.coachId,
            name: 'history.html'
            }
        );
    }

    onEditDescription = (mode) => {
        console.log(mode);
        this.setState({ editMode: mode });

        if (mode) {
            return;
        }

        socket.emit(
            'coachContent', {
            content: this.coachDescription,
            fuzzyId: this.coachId,
            name: 'description.html'
            }
        );
    }

    handleDescriptionText = (text) => {
        this.coachDescription = text;
    }

    handleHistoryText = (text) => {
        this.coachHistory = text;
    }

    renderCoachDescription = () => {

        if(this.state.editMode) {
            return <Editor id="coach_about" value={this.coachDescription} onChange={this.handleDescriptionText} height={300}/>
        }

        return (
             <Editor id="coach_about" value={this.coachDescription} readOnly={true} height={300}/>
        )
    }
    renderCoachHistory = () => {

        if(this.state.editMode) {
            return <Editor id="coach_history" value={this.coachHistory} onChange={this.handleHistoryText} height={300}/>
        }

        return (
             <Editor id="coach_history" value={this.coachHistory} readOnly={true} height={300}/>
        )
    }

    render() {

        return (
          <>
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px",marginTop: "10px" }}
                title={<Title level={4}>About Coach</Title>} extra={this.getEditDescriptionButton()}>
                {this.renderCoachDescription()}
            </Card>
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px",marginTop: "10px" }}
                title={<Title level={4}>Coach History</Title>} extra={this.getEditHistoryButton()}>
                {this.renderCoachHistory()}
            </Card>

         </>
        );

    }
}
