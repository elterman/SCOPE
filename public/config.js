// These entries are replaced by tokenization of index.release.html during release, this version of index.html is never deployed
window.msalConfig = {
  auth: {
    clientId: 'cc2c86ed-ad50-4359-bd83-c796d68d4359',
    authority: 'https://login.microsoftonline.com/337b9f7b-9e69-4689-9b0d-3417bd3d8566',
    validateAuthority: true,
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

window.apiConfig = {
  resourceUri: 'https://newdevfip001.gmo.tld:5000/api/v1/scope',
  // resourceUri: 'https://localhost:5000/api/v1/scope',
  resourceHub: 'https://newdevfip001.gmo.tld:5000/scopeHub',
  resourceScope: 'api://e089540a-89da-4a0c-8ccd-14d89b572e29/access_as_user',
};
