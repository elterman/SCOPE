import { AuthenticationResult } from '@azure/msal-browser';
import { getAccess } from './Utils';
import { apiConfig } from './MsalConfig';

export async function getMatlabSearchPath(accessToken: string) {
  var res = fetch(apiConfig.resourceUri + '/GetMatlabSearchPath', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response && response.status !== 404) {
        return response.json();
      }
    })
    .catch((err) => console.log(err));

  return res;
}

export const doFetch = (request: string, body: any, auth: any, resolve: any, signal: any = null) => {
  getAccess(auth, (ar: AuthenticationResult) => {
    const init: any = {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${ar.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      init.body = JSON.stringify(body);
    }

    if (signal) {
      init.signal = signal;
    }

    fetch(apiConfig.resourceUri + '/' + request, init)
      .then((res) => {
        return res.ok ? res.json() : Promise.reject({ status: res.status, message: res.statusText });
      })
      .then((data) => {
        const err = data.ErrorMessage && data.ErrorMessage !== '';
        resolve({ ok: !err, data: data }); // if err, basically passing data.ErrorMessage to toast
      })
      .catch((err) => {
        resolve({ ok: false, data: { ErrorMessage: err.message } });
      });
  });
};
