Package.describe({
    name: 'tigrente:hpid-oauth',
    git: 'https://github.com/tigrente/hpid-oauth',
    documentation: 'README.md',
    summary: 'HP ID OAuth flow',
    version: '0.1.0',
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
