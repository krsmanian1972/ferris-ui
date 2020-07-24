import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Card, Spin, Result, Carousel } from 'antd';

import { assetHost } from '../stores/APIEndpoints';
import { LeftCircleFilled,RightCircleFilled } from '@ant-design/icons';

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
                <Result status="warning" title={store.message.help} />
            )
        }

        return (<></>)
    }

    next = () => {
        this.carousel.next();
    }
    previous = () => {
        this.carousel.prev();
    }

    getCoverUrl = (program) => {
        return `${assetHost}/programs/${program.fuzzyId}/cover/cover.png`;
    }

    render() {
        const store = this.props.programListStore;
        const programs = store.programs;
        const props = {
            dots:false,
            slidesToShow: Math.min(3,store.rowCount),
            slidesToScroll: 1,
        };

        return (
            <div style={{display: "flex", flexDirection: "row", justifyContent:"center", textAlign:"center", alignItems:"center"}}>
                <LeftCircleFilled style={{width: "5%"}} onClick={this.previous} />
                <div style={{ width: "90%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...props}>
                        {programs && programs.map(item => {
                            return (
                                <div key={item.fuzzyId} style={{display:"flex", flexDirection:"column"}}>
                                    <div style={{textAlign:"center",height:150}} onClick={() => this.props.showProgramDetail(item.fuzzyId)}>
                                        <div style={{display:"inline-block",verticalAlign:"middle",height:150}}></div>
                                        <img style={{maxHeight:"100%",maxWidth:"100%", verticalAlign:"middle", display:"inline-block"}} src={this.getCoverUrl(item)} />
                                    </div>
                                    <p style={{textAlign:"center"}}>{item.name}</p>  
                                </div>
                            )
                        })}
                    </Carousel>
                </div>
                <RightCircleFilled style={{width: "5%"}} onClick={this.previous} />
                {this.displayMessage()}
            </div>
        )
    }
}
export default ProgramList;