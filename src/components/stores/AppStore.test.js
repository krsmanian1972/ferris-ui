import MockAPIProxy from './test_data/MockAPIProxy';
import {appStore} from './AppStore';
import LoginStore from './LoginStore';

it('Load Login Page if no local storage is set', () =>{    
    appStore.setSessionFromStorage();
    
    expect(appStore.credentials.email).toEqual("");
    expect(appStore.credentials.token).toEqual("");
    expect(appStore.credentials.id).toEqual("");

    expect(appStore.currentComponent.key).toEqual("login");
    expect(appStore.currentComponent.isLandingPage).toEqual(true);
})

