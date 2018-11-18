//todo: Add testing components

Package.describe({
    name: 'tigrente:hpid-oauth',
    git: 'https://github.com/tigrente/hpid-oauth',
    documentation: 'README.md',
    summary: 'HP ID OAuth flow',
    version: '0.1.0',
});

Package.onUse((api) => {
    api.use('ecmascript@0.1.2', ['client', 'server']);
    api.use('oauth2@1.2.1', ['client', 'server']);
    api.use('oauth@1.2.6', ['client', 'server']);
    api.use('http@1.4.2', 'server');
    api.use('random@1.1.0', 'client');
    api.use('service-configuration@1.0.11', ['client', 'server']);

    api.addFiles('hpid_client.js', 'client');
    api.addFiles('hpid_server.js', 'server');

    api.export('Hpid');
});
