
export default class APIProxy {

  authHeaders = {
    'token': '',
    'email': '',
    'userFuzzyId': ''
  }

  getUserFuzzyId = () => {
    return this.authHeaders.userFuzzyId;
  }

  updateCredentialHeaders(credentials) {
    this.authHeaders = {
      'token': credentials.token,
      'email': credentials.email,
      'userFuzzyId': credentials.id,
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

  query(url, queryString, variables) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access-control-allow-origin': '*',
        ...this.authHeaders
      },
      body: JSON.stringify({ query: queryString, variables })
    });
  }

  mutate(url, mutationQueryString, variables) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access-control-allow-origin': '*',
        ...this.authHeaders
      },
      body: JSON.stringify({ query: mutationQueryString, variables })
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
