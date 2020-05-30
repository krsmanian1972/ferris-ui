import MockAPIProxy from './test_data/MockAPIProxy';
import {appStore} from './AppStore';
import LoginStore from './LoginStore';

it('Load Login Page if no local storage is set', () =>{    
    appStore.setSessionFromStorage();
    
    expect(appStore.credentials.email).toEqual("");
    expect(appStore.credentials.token).toEqual("");
    expect(appStore.credentials.userFuzzyId).toEqual("");

    expect(appStore.currentComponent.key).toEqual("Login");
    expect(appStore.currentComponent.label).toEqual("Login");
    expect(appStore.currentComponent.isLandingPage).toEqual(true);
})

it('should setCredentials upon succeddful authentication', async () => {
    const loginCredentials = require('./test_data/loginCredentials.test.json');

    const apiProxy = new MockAPIProxy(loginCredentials);
    appStore.apiProxy = apiProxy;
 
    appStore.loginStore = new LoginStore({apiProxy: apiProxy});
    appStore.loginStore.loginCredentials.email = loginCredentials.email;
    appStore.loginStore.loginCredentials.password = 'password';

    await appStore.authenticate();

    expect(appStore.credentials.token).toEqual("123");
    expect(appStore.credentials.userFuzzyId).toEqual("1-1");
})

it('should handle transitions', () => {
    
})
