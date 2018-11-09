Hpid = {};

const HPID_HOST_NAME = 'directory.stg.cd.id.hp.com';

OAuth.registerService('hpid', 2, null, (query) => {
  const accessToken = getAccessToken(query);
  const identity = getIdentity(accessToken);
  const emails = getEmails(accessToken);
  const primaryEmail = emails.find(email => email.primary);

  return {
    // todo: update for HP-ID criteria
    serviceData: {
      id: identity.id,
      accessToken: OAuth.sealSecret(accessToken),
      email: identity.email || (primaryEmail && primaryEmail.email) || '',
      username: identity.login,
      emails,
    },
    options: { profile: { name: identity.name } },
  };
});


let userAgent = 'Meteor';
if (Meteor.release) { userAgent += `/${Meteor.release}`; }

const getAccessToken = (query) => {
  const config = ServiceConfiguration.configurations.findOne({ service: 'hpid' });
  if (!config) { throw new ServiceConfiguration.ConfigError(); }

  let response;
  try {
    // todo: upate response for HP-ID
    response = HTTP.post('https://<HPID_HOST_NAME>/directory/v1/oauth/token', {
      headers: {
        Authorization: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri('hpid', config),
        state: query.state,
      },
    });
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to complete OAuth handshake with HP ID. ${err.message}`),
      { response: err.response },
    );
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error(`Failed to complete OAuth handshake with HP ID. ${response.data.error}`);
  } else {
    return response.data.access_token;
  }
};


// todo: update getIdentity for HP
const getIdentity = (accessToken) => {
  try {
    return HTTP.get('https://<HPID_HOST_NAME>/directory/v1/scim/v2/Me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).data;
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to fetch identity from HPID. ${err.message}`),
      { response: err.response },
    );
  }
};


// todo: update getEmotails for HP-ID
const getEmails = (accessToken) => {
  try {
    return HTTP.get('https://api.hp.com/user/emails', {
      headers: { 'User-Agent': userAgent }, // http://developer.hp.com/v3/#user-agent-required
      params: { access_token: accessToken },
    }).data;
  } catch (err) {
    return [];
  }
};

Hpid.retrieveCredential = (credentialToken, credentialSecret) =>
  OAuth.retrieveCredential(credentialToken, credentialSecret);
