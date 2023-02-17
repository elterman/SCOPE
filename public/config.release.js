// These entries are replaced by tokenization during release
window.msalConfig = {
  auth: {
      clientId: '#{clientId}#',
      authority: "https://login.microsoftonline.com/337b9f7b-9e69-4689-9b0d-3417bd3d8566",
      validateAuthority: true,
      redirectUri: '#{redirectUri}#'
  },
  cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false
  }
};

window.apiConfig = {
  resourceUri: "#{resourceUri}#",
  resourceHub: "#{resourceHub}#",
  resourceScope: "#{resourceScope}#"
}
