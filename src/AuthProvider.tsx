import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PublicClientApplication, AuthenticationResult, SilentRequest } from '@azure/msal-browser';
import { msalConfig, loginRequest, graphTokenRequest, apiTokenRequest } from './MsalConfig';
import { getUserDetails, getUserPhoto } from './GraphService';
import { useSetAtom } from 'jotai';
import { auth_info } from './atoms';

interface UserInfo {
  displayName: string;
  email: any;
  avatar: string;
}

const AuthProvider = (props: any) => {
  const [error, setError] = useState<any>(null);
  const [username, setUserName] = useState<string | null>();
  const [isAuthenticated, setAuthenticated] = useState<boolean>();
  const [user, setUser] = useState<UserInfo>();
  const l: any = useRef({}).current;
  const setAuth = useSetAtom(auth_info);

  const getAccessToken = useCallback(
    async (uname: string, scopes: string[] = apiTokenRequest?.scopes) => {
      try {
        let account = l.msalInstance.getAccountByUsername(uname || '');
        if (account) {
          // Get the access token silently
          // If the cache contains a non-expired token, this function
          // will just return the cached token. Otherwise, it will
          // make a request to the Azure OAuth endpoint to get a token
          let request: SilentRequest = {
            scopes: scopes,
            account: account,
          };

          var silentResult = await l.msalInstance.acquireTokenSilent(request);
          return silentResult;
        }

        throw new Error('Account cannot be retrieved from msalInstance, see app support.');
      } catch (err: any) {
        // If a silent request fails, it may be because the user needs
        // to login or grant consent to one or more of the requested scopes
        if (isInteractionRequired(err)) {
          var interactiveResult = await l.msalInstance.acquireTokenPopup({
            scopes: scopes,
          });

          return interactiveResult;
        } else {
          throw err;
        }
      }
    },
    [l.msalInstance]
  );

  const getUserProfile = useCallback(
    (uname: string) => {
      try {
        getAccessToken(uname, graphTokenRequest.scopes).then((res) => {
          const authenticationResult: AuthenticationResult = res;
          if (authenticationResult) {
            // Get the user's profile from Graph
            getUserDetails(authenticationResult.accessToken).then((userDetails) => {
              getUserPhoto(authenticationResult.accessToken)
                .then((photo) => {
                  setAuthenticatedUser(userDetails, URL.createObjectURL(photo));
                  setError(null);
                })
                .catch((err) => {
                  setAuthenticatedUser(userDetails);
                  console.log(normalizeError(err));
                });
            });
          }
        });
      } catch (err: any) {
        setAuthenticated(false);
        setUserName(null);
        setError(normalizeError(err));
      }
    },
    [getAccessToken]
  );

  const handleResponse = useCallback(
    (response: any) => {
      if (response !== null) {
        setUserName(response.account.username);
        getUserProfile(response.account.username);
      } else {
        // From sample: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-browser-samples/VanillaJSTestApp2.0/app/onPageLoad/auth.js
        // need to call getAccount here?
        const currentAccounts = l.msalInstance.getAllAccounts();
        if (!currentAccounts || currentAccounts.length < 1) {
          l.msalInstance.loginRedirect(loginRequest);
        } else if (currentAccounts.length > 1) {
          // Add choose account code here
          // crock: will this happen?
          console.error('Multiple accounts detected.');
        } else if (currentAccounts.length === 1) {
          setUserName(currentAccounts[0].username);
          getUserProfile(currentAccounts[0].username);
        }
      }
    },
    [l.msalInstance, getUserProfile]
  );

  useEffect(() => {
    if (l.msalInstance) {
      return;
    }

    l.msalInstance = new PublicClientApplication(msalConfig);

    l.msalInstance
      .handleRedirectPromise()
      .then(handleResponse)
      .catch((err: any) => setError(err.errorMessage));
  }, [l, handleResponse]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setAuth({
        isAuthenticated,
        error,
        username,
        user,
        getAccessToken: () => getAccessToken(username || ''),
        setError: (message: string, debug: string) => setError({ message, debug }),
      });
    }
  }, [isAuthenticated, error, user, username, getAccessToken, setAuth]);

  const setAuthenticatedUser = (details: any, avatar: string = '') => {
    setAuthenticated(true);
    setUser({ displayName: details.displayName, email: details.mail || details.userPrincipalName, avatar });
  };

  const normalizeError = (error: string | Error): any => {
    var normalizedError = {};

    if (typeof error === 'string') {
      var errParts = error.split('|');
      normalizedError = errParts.length > 1 ? { message: errParts[1], debug: errParts[0] } : { message: error };
    } else {
      normalizedError = {
        message: error.message,
        debug: JSON.stringify(error),
      };
    }

    return normalizedError;
  };

  const isInteractionRequired = (error: Error): boolean => {
    if (!error.message || error.message.length <= 0) {
      return false;
    }

    return (
      error.message.indexOf('consent_required') > -1 ||
      error.message.indexOf('interaction_required') > -1 ||
      error.message.indexOf('login_required') > -1
    );
  };

  return <>{props.children}</>;
};

export default AuthProvider;
