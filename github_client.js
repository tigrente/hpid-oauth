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

    const config = ServiceConfiguration.configurations.findOne({service: 'hpid'});
    if (!config) {
        credentialRequestCompleteCallback && credentialRequestCompleteCallback(
            new ServiceConfiguration.ConfigError());
        return;
    }
    const credentialToken = Random.secret();

    const scope = (options && options.requestPermissions) || ['user:email'];
    const flatScope = scope.map(encodeURIComponent).join('+');

    const loginStyle = OAuth._loginStyle('hpid', config, options);

    //todo:update login URL request
    const loginUrl =
        'https://hp.com/login/oauth/authorize' +
        `?client_id=${config.clientId}` +
        `&scope=${flatScope}` +
        `&redirect_uri=${OAuth._redirectUri('hpid', config)}` +
        `&state=${OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl)}`;

    OAuth.launchLogin({
        loginService: "hpid",
        loginStyle,
        loginUrl,
        credentialRequestCompleteCallback,
        credentialToken,
        popupOptions: {width: 900, height: 450}
    });
};