/**
  A Repeater that returns the injected data to faciliate testing the components behaviours
*/
export default class MockAPIProxy {

  constructor(data) {
    this.data = data;
  }
  /**
    Useful when invoking obtaining a feedbackContext
  */
  get(url,action) {
    action(this.data);
  }

  asyncPost(url,bodyParams) {
      return new Promise((resolve,reject) => {
        resolve(this);
      }
    );
  }

  getAsync(url) {
    return this;
  }

  json = () => {
    return this.data;
  }
  /**
    Useful when invoking the save identifaction.
    Let us return the captured feedback_context.
  */
  post(url,bodyParams,action) {
    action(this.data);
  }

  updateCredentialHeaders(param){

  }
}
