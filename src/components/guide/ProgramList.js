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

    getCoverUrl = (program) => {
        return `${assetHost}/programs/${program.fuzzyId}/cover/cover.png`;
    }

    render() {
        const store = this.props.programListStore;
        const programs = store.programs;
        
        return (
            <List
                style={{marginTop:10}}
                grid={{column: 3}}
                dataSource={programs}
                renderItem={item => (
                    <List.Item> 
                        <Card title={item.name} 
                            style={{height:527,width:326,border:'1px solid lightgray'}}
                            onClick={() => this.props.showProgramDetail(item.fuzzyId)}
                            cover={<img alt="cover" style={{border:"1px solid lightgray", height:180,width:326}} src={this.getCoverUrl(item)}/>}
                        >
                            <Meta description={item.description}/>
                        </Card>
                    </List.Item>
                )}>
                {this.displayMessage()}
            </List>
        )
    }
}
export default ProgramList;