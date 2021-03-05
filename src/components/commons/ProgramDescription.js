import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Card, Typography } from 'antd';

import Editor from "./Editor";
import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;

@observer
class ProgramDescription extends Component {

    /**
     * We populate the description from the respective content location
     * at the Program Store.
     */
    renderDescription = () => {
        const program = this.props.program;
        return <Editor id="about" value={program.description} readOnly={true} height={300} />
    }

    render() {
        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ borderRadius: "12px", marginTop: "10px" }}
                title={<Title level={4}>About</Title>}>
                {this.renderDescription()}
            </Card>
        );
    }
}
export default ProgramDescription;