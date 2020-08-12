import React, { Component } from 'react';
import { observer } from 'mobx-react';

import {Card,Typography } from 'antd';

import Editor from "./Editor";

const {Title} = Typography;

@observer
export default class ProgramDescription extends Component {

    constructor(props) {
        super(props);
    }

    renderDescription = () => {
        const program = this.props.program;
        return <Editor id="about" value={program.description} readOnly={true} height={300}/>
    }

    render() {
        return (
            <Card title={<Title level={4}>About</Title>}>
                {this.renderDescription()}
            </Card>
        );
    }
}