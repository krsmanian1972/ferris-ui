import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import katex from "katex";
import "katex/dist/katex.min.css";

window.katex = katex;

export default class Editor extends Component {

    constructor(props) {
        super(props);
        this.modules = {
            toolbar: {container: `#${props.id}`}
        }
    }

    render_toolbar = () => {
        return (
            <div id={this.props.id}>
                <select className="ql-header" defaultValue="">
                    <option value="1" />
                    <option value="2" />
                    <option value="3" />
                    <option value="" />
                </select>
                
                <span className="ql-formats">
                    <button className="ql-list" value="ordered" />
                    <button className="ql-list" value="bullet" />
                </span>
                
                <span className="ql-formats">    
                    <button className="ql-indent" value="-1" />
                    <button className="ql-indent" value="+1" />
                </span>

                <span class="ql-formats">   
                    <select className="ql-align" defaultValue="">    
                        <option value="center"/>
                        <option value="right"/>
                        <option value=""/>
                    </select>
                </span>
        
                <span class="ql-formats">     
                    <button className="ql-bold" />
                    <button className="ql-italic" />
                    <button className="ql-underline" />
                    <button className="ql-strike" />  
                </span>

                <span class="ql-formats">    
                    <button className="ql-formula" />
                    <button className="ql-code-block" />
                </span>
                
                <span class="ql-formats">
                    <button className="ql-link" />
                    <button className="ql-image" />
                    <button className="ql-video" />
                </span>

               
            </div>
        )
    }

    render() {
        return (
            <div>
                <div style={{ display: this.props.readOnly ? 'none' : 'block' }}>
                    {this.render_toolbar()}
                </div>    
                <ReactQuill
                    theme={"snow"}
                    formats={Editor.formats}
                    modules={this.modules}
                    onChange={this.props.onChange}
                    value={this.props.value}
                    readOnly={this.props.readOnly}
                />
            </div>
        )
    }
}

/* 
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
    'header',
    'bold', 'italic', 'underline',"strike",
    'list', 'indent', 'align',
    'link','image','video',
    'code-block',
    'formula',
]
