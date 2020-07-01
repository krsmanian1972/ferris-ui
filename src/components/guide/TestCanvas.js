import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';


@inject("appStore")
@observer
class TestCanvas extends Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        this.canvas.height = screen.height-20;
        this.canvas.width = screen.width-20;

        this.ctx = this.canvas.getContext("2d");

        window.addEventListener("resize", this.handleWindowResize);

        this.canvas.addEventListener("dblclick", this.write);

        this.writeTitle();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    handleWindowResize = () => {
        
    }


    writeTitle = () => {

        const boardKey = `${this.props.boardId}`;

        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(boardKey, 10, 10);
    }

    write = (event) => {
        if(!this.canvas) {
            return;
        }

        var rect = this.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
    
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText("H", x, y);
    }

    render() {
        
        const boardKey = `canvas-${this.props.boardId}`;
    
        return (
            <>
                <canvas key={boardKey} ref={ref => (this.canvas = ref)} />
            </>    
        )
    }
}
export default TestCanvas;