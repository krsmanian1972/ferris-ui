import React, { Component } from 'react';

const SESSION_USER_FUZZY_ID = 'd91e5527-9cc3-4d56-9c69-d386c9cba535';

class MiniBoard extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
        this.restore();
    }

    restore = async() => {

        const url = "http://localhost:8088/board_file";

        const response = await this.props.apiProxy.getAsync(url);
        const data = await response.text();

        var img = new Image();
        var me = this;
        img.onload = function () {
            console.log("onload of miniboard");
            me.ctx.drawImage(img,0,0,img.width,img.height);
        }
        img.src = data;
    }

    render() {
        const boardKey = `mini-canvas-${this.props.boardId}`;

        return (
            <>
                {this.props.boardId}
                <div className="miniBoardFrame">
                    <canvas height={screen.height*0.80} width={screen.width*0.94} className="miniBoard" key={boardKey} ref={ref => (this.canvas = ref)} />
                </div>    
            </>
        )
    }
}
export default MiniBoard;