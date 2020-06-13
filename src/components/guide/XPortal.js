import React from 'react';
import ReactDOM from 'react-dom';

function copyStyles(sourceDoc, targetDoc) {
    Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
        if (styleSheet.cssRules) { // true for inline styles
            const newStyleEl = sourceDoc.createElement('style');

            Array.from(styleSheet.cssRules).forEach(cssRule => {
                newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
            });

            targetDoc.head.appendChild(newStyleEl);
        } else if (styleSheet.href) { // true for stylesheets loaded from a URL
            const newLinkEl = sourceDoc.createElement('link');

            newLinkEl.rel = 'stylesheet';
            newLinkEl.href = styleSheet.href;
            targetDoc.head.appendChild(newLinkEl);
        }
    });
}
class XPortal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.containerEl = document.createElement('div'); // STEP 1: create an empty div
        this.externalWindow = null;
    }

    componentDidMount() {
        const h = screen.height*0.75;
        const w = screen.width*0.75;

        // STEP 3: open a new browser window and store a reference to it
        this.externalWindow = window.open('', '', 'toolbar=yes ,location=0, status=no,titlebar=no,menubar=yes,width='+w +',height=' +h);

        
       
        // STEP 4: append the container <div> (that has props.children appended to it) to the body of the new window
        this.externalWindow.document.body.appendChild(this.containerEl);
        this.externalWindow.document.title = this.props.name;

        copyStyles(document, this.externalWindow.document);

        // update the state in the parent component if the user closes the 
        // new window
        this.externalWindow.addEventListener('beforeunload', () => {
            this.props.closeWindowPortal();
        });

        this.externalWindow.addEventListener("resize", () => { 
            const portalSize = {height:this.externalWindow.innerHeight,width:this.externalWindow.innerWidth};
            this.props.portalResized(portalSize);
        });
    }

    componentWillUnmount() {
        // This will fire when this.state.showWindowPortal in the parent component becomes false
        // So we tidy up by just closing the window
        this.externalWindow.close();
    }

    render() {
        // STEP 2: append props.children to the container <div> that isn't mounted anywhere yet
        return ReactDOM.createPortal(this.props.children, this.containerEl);
    }
}
export default XPortal