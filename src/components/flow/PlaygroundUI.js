import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Row, Col, Typography, Tooltip, Space } from 'antd';
import { ScissorOutlined, CloseOutlined, AimOutlined, PlusOutlined } from '@ant-design/icons';

import CoinFlipGame from './CoinFlipGame';


const { Title } = Typography;

const containerStyle = {
    height: window.innerHeight * 0.81,
    width: window.innerWidth
};

const graphPaperStyle = {
    border: "1px solid black",
    borderRadius: "12px",
    maxHeight: window.innerHeight * 0.81,
    overflowY: "auto"
}

@inject("appStore")
@observer
class PlaygroundUI extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.composer = new CoinFlipGame(this.container);

    }
  

    render() {
        return (
            <div>
                <div key="graphPaper" style={graphPaperStyle}>
                    <div key="container" style={containerStyle} id="container" ref={ref => (this.container = ref)} />
                </div>
            </div>
        )
    }
}

export default PlaygroundUI;