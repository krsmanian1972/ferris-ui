import React, { Component } from 'react';
import { observer } from 'mobx-react';

import {Card } from 'antd';

import Editor from "./Editor";

@observer
export default class ProgramDescription extends Component {

    constructor(props) {
        super(props);
    }

    renderDescription = () => {
        const program = this.props.program;
        return <Editor id="about" value={program.description} readOnly={true} />
    }

    render() {
        return (
            <Card title="About">
                {this.renderDescription()}
            </Card>
        );
    }
}