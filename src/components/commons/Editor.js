import React, { Component } from 'react';
import ReactQuill from 'react-quill';

export default class Editor extends Component {
    render() {
        return (
            <div className="text-editor">
                <div style={{ display: this.props.readOnly ? 'none' : 'block' }}>
                    <CustomToolbar />
                </div>
                <ReactQuill
                    theme={"snow"}
                    formats={Editor.formats}
                    modules={Editor.modules}
                    onChange={this.props.onChange}
                    value={this.props.value}
                    readOnly={this.props.readOnly}
                />
            </div>
        )
    }
}

/* 
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Editor.modules = {
    toolbar: {
        container: "#toolbar"
    }
}

/* 
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'indent', 'align',
]

/* 
 * CustomToolbar Component
 */
const CustomToolbar = () => (
    <div id="toolbar">
        <select className="ql-header" defaultValue="">
            <option value="1" />
            <option value="2" />
            <option value="3" />
            <option value="" />
        </select>
        <span className="ql-formats">
            <button className="ql-list" value="ordered" />
            <button className="ql-list" value="bullet" />
            <button className="ql-indent" value="-1" />
            <button className="ql-indent" value="+1" />
            <button className="ql-align" value=""></button>
            <button className="ql-align" value="center"></button>
            <button className="ql-align" value="right"></button>
        </span>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />  

       
    </div>
)
