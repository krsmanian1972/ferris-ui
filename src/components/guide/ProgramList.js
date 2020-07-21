import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { List, Card, Spin, Result } from 'antd';

import {assetHost} from '../stores/APIEndpoints';

const { Meta } = Card;

@observer
class ProgramList extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.programListStore.fetchPrograms();
    }

    getActive = (flag) => {
        if (flag) {
            return 'Active';
        }
        return 'Inactive';
    }

    displayMessage = () => {
        const store = this.props.programListStore;

        if (store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (store.isError) {
            return (
                <Result status="warning" title={store.message.help}/>
            )
        }

        return (<></>)
    }

    getCover = (program) => {
        return `${assetHost}/programs/${program.fuzzyId}/cover/cover.png`;
    }

    render() {
        const store = this.props.programListStore;
        const programs = store.programs;
        
        return (
            <List
                grid={{ gutter: [16, 16], column: 4}}
                dataSource={programs}
                renderItem={item => (
                    <List.Item> 
                        <Card title={item.program.name} 
                            style={{height:400}}
                            onClick={() => this.props.showProgramDetail(item.program.fuzzyId)}
                            cover={<img alt="cover" style={{height:180}} src={this.getCover(item.program)}/>}
                        >
                            <Meta description={item.program.description}/>
                        </Card>
                    </List.Item>
                )}>
                {this.displayMessage()}
            </List>
        )
    }
}
export default ProgramList;