import React, { Component  } from 'react';
import { inject, observer} from 'mobx-react';
import { Card, Timeline,Typography} from 'antd';

const stageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
};

const { Title } = Typography;

@inject("appStore")
@observer
class CurrentSessionPlan extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
           <Card style={stageStyle} title={<Title level={4}>Session Progress</Title>}>
                <Timeline>
                    <Timeline.Item color="green">Introduction</Timeline.Item>
                    <Timeline.Item color="green">Returning Traits with Dyn</Timeline.Item>
                    <Timeline.Item color="green">Drop Trait</Timeline.Item>
                    <Timeline.Item color="blue">
                        <p>Solve Example 1</p>
                        <p>Solve Example 2</p>
                    </Timeline.Item>
                    <Timeline.Item color="gray">Impl Trait
                        <p>Example1</p>
                        <p>Example2</p>
                    </Timeline.Item>
                    <Timeline.Item color="gray">Assignments 
                        <p>Exercise - 1</p>
                        <p>Exercise - 2</p>
                    </Timeline.Item>
                </Timeline>
            </Card>
        )
    }
}

export default CurrentSessionPlan