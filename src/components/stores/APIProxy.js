
export default class APIProxy {

  authHeaders = {
    'token': '',
    'email': '',
    'userFuzzyId': ''
  }

  updateCredentialHeaders(credentials) {
    this.authHeaders = {
      'token': credentials.token,
      'email': credentials.email,
      'userFuzzyId':credentials.userFuzzyId
    }
  }

  get(url, action) {
    fetch(url, {
      headers: {
        ...this.authHeaders
      },
    })
      .then(response => response.json())
      .then(json => {
        action(json);
      });
  }

  post(url, bodyParams, action) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...this.authHeaders
      },
      body: JSON.stringify(bodyParams)
    })
      .then(response => response.json())
      .then(json => {
        action(json);
      });
  }

  asyncPost(url, bodyParams) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access-control-allow-origin': '*',
        ...this.authHeaders
      },
      body: JSON.stringify(bodyParams)
    });
  }

  asyncDelete(url, bodyParams) {
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access-control-allow-origin': '*',
        ...this.authHeaders
      },
      body: JSON.stringify(bodyParams)
    });
  }

  getAsync(url) {
    return fetch(url, {
      headers: {
        ...this.authHeaders
      }
    }
    );
  }
}
