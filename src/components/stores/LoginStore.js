import { apiHost } from './APIEndpoints';
import {authenticationQuery} from './Queries';

const INVALID = 'invalid';
const DONE = 'done';
const ERROR = 'error';

export default class LoginStore {
   
    constructor(props) {
        this.apiProxy = props.apiProxy
        this.appStore = props.appStore
    }

    
    authenticate = async (values) => {

        const variables = {
            request: {
                email: values.email,
                password: values.password
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost,authenticationQuery,variables);
            const result = await response.json();
            if(result.data == null) {
                return {state:INVALID, data:null};    
            }
            return {state:DONE, data:result.data.authenticate};
        }
        catch (e) {
            console.log(e);
            return {state:ERROR, data:null};
        }
    }
}
