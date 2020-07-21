import React, { Component } from 'react';
import { inject } from 'mobx-react';

const stageStyle = {
    minHeight: 400,
    maxHeight: 400,
    position: "relative",
    overflow: "hidden",
};

@inject("appStore")
class BookPage extends Component {

    constructor(props) {
        super(props);
    }

    getCode = () => {

        var code = String.raw`
            struct Circle {
                x: f64,
                y: f64,
                radius: f64,
            }
            
            trait HasArea {
                fn area(&self) -> f64;
            }
            
            impl HasArea for Circle {
                fn area(&self) -> f64 {
                    std::f64::consts::PI * (self.radius * self.radius)
                }
            }     
        `;

        return (
            <pre>{code}</pre>
        )
    }

    render() {
        return (
            <div style={stageStyle}>
                <p>{this.props.params.programFuzzyId}</p>
                <p>{this.props.params.parentKey}</p>
                <p>A trait is a language feature that tells the Rust compiler about functionality a type must provide.</p>
                {this.getCode()}
            </div>
        )
    }
}
export default BookPage