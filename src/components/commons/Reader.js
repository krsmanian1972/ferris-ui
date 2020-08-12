import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import katex from "katex";
import "katex/dist/katex.min.css";

window.katex = katex;

export default class Reader extends Component {

    constructor(props) {
        super(props);
        this.modules = {
            toolbar: false
        }
    }

    render() {
        const height = this.props.height
        return (
            <div style={{ height: height, overflow: "auto"}}>
                <ReactQuill
                    theme={"snow"}
                    modules={this.modules}
                    value={this.props.value}
                    readOnly={true}
                />
            </div>
        )
    }
}


