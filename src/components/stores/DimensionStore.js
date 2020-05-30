import { observable, decorate, action, computed } from "mobx";



class DimensionStore {
    content_ratio = 65 / 100;
    initialHeight = 0;    
    expandedHeight = 0;
    height = 0;
    isExpanded = false;

    setDimension = (initialHeight,expandedHeight) =>{
        this.initialHeight = initialHeight;
        this.expandedHeight = expandedHeight;
        this.height = initialHeight;
    }

    expand = () => {
        this.height = this.expandedHeight;
        this.isExpanded = true;
    }

    restore = () => {
        this.height = this.initialHeight;
        this.isExpanded = false;
    }

    adjustSize = () => {
        this.isExpanded ? this.restore() : this.expand();
    }

    mailHeight = () => {
        const height = this.height;
        return { height: height };
    }

    contentHeight = () => {
        const height = this.height * this.content_ratio;
        return { height: height, maxHeight: height };
    }

    get mailWidth() {
        return this.isExpanded ? 9 : 6
    }
}
decorate(DimensionStore, {
    height: observable,
    isExpanded: observable,
    adjustSize: action,
    mailWidth: computed,
});


export const dimensionStore = new DimensionStore();