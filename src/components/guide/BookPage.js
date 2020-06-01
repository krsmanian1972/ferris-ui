import React, { Component  } from 'react';
import { inject } from 'mobx-react';

@inject("appStore")
class BookPage extends Component {

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

        return(
            <pre>{code}</pre>
        )
    }

    render() {
        return (
            <>
                <p>A trait is a language feature that tells the Rust compiler about functionality a type must provide.</p>
                {this.getCode()}
            </>    
        )
    }
}
export default BookPage