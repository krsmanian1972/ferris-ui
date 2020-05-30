import { decorate, observable, flow, action } from 'mobx';

class DrawerStore {
    showDrawer = false;

    toggle  = () => {
        this.showDrawer = !this.showDrawer;
    }
}

decorate(DrawerStore, {
    showDrawer: observable,
    toggle: action,
});
export const drawerStore = new DrawerStore();