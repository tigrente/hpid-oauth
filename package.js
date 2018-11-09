Package.describe({
  summary: 'HP ID OAuth flow',
  version: '0.0.2',
});

Package.onUse((api) => {
  api.use('ecmascript', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', 'server');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.addFiles('hpid_client.js', 'client');
  api.addFiles('hpid_server.js', 'server');

  api.export('Hpid');
});
