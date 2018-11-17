Hpid = {};

// Request Hpid credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Hpid.requestCredential = (options, credentialRequestCompleteCallback) => {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  const config = ServiceConfiguration.configurations.findOne({ service: 'hpid' });
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError());
    return;
  }
  const credentialToken = Random.secret();

  const scope = (options && options.requestPermissions) || ['user:email'];
  // const flatScope = scope.map(encodeURIComponent).join('+');

  const loginStyle = OAuth._loginStyle('hpid', config, options);

  // todo: build in mech to distinguish from staging and production services

  const loginUrl =
        'https://directory.stg.cd.id.hp.com/directory/v1/oauth/authorize' +
        '?response_type=code' +
        `&client_id=${config.clientId}` +
        `&redirect_uri=${encodeURIComponent(OAuth._redirectUri('hpid', config))}` + // todo: This doesn't work because HP ID requires a %5F instead of an '_', but the OAuth._redirect uri returns an _
        '&scope=user.profile.read' +
        `&state=${OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl)}`;

  OAuth.launchLogin({
    loginService: 'hpid',
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken,
    popupOptions: { width: 900, height: 450 }, // Extraneous - usually go to a new page to login
  });
};
