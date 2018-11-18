//NOTE:  If you are getting this error:
// EPROTO 4558878144:error:14077419:SSL routines:SSL23_GET_SERVER_HELLO:tlsv1 alert access denied
// You are likely behind a proxy.


// Create Base64 Object  - this is to encode the authorization in base64
let Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
    }, decode: function (e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9+/=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u !== 64) {
                t = t + String.fromCharCode(r)
            }
            if (a !== 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base64._utf8_decode(t);
        return t
    }, _utf8_encode: function (e) {
        e = e.replace(/rn/g, "n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    }, _utf8_decode: function (e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }
};


Hpid = {};

const HPID_HOST_NAME = 'directory.stg.cd.id.hp.com';

OAuth.registerService('hpid', 2, null, (query) => {
    const accessToken = getAccessToken(query);
    const identity = getIdentity(accessToken);
    const emails = identity.emails;
    const primaryEmail = emails.find(email => email.primary).value;

    return {
        // todo: update for HP-ID criteria


        serviceData: {
            id: identity.id,
            accessToken: OAuth.sealSecret(accessToken),
            email: primaryEmail,
            username: identity.userName,
            emails,
        },
        options: {
            profile:
                {
                    name: {
                        last: identity.name.familyName,
                        first: identity.name.givenName
                    }
                }
        }
    }
});


let userAgent = 'Meteor';
if (Meteor.release) {
    userAgent += `/${Meteor.release}`;
}

const getAccessToken = (query) => {
    const config = ServiceConfiguration.configurations.findOne({service: 'hpid'});
    if (!config) {
        throw new ServiceConfiguration.ConfigError();
    }
//todo:  cleanup logging
    //console.log('We go here, no error.. Keep going.');
    //console.log(`Secret: ${config.secret}`);
    //console.log(`code: ${query.code}`);

    // Construct Authorization header and encode in base634

    const authcode = `${config.clientId}:${config.secret}`;
    const encodedAuthcode = Base64.encode(authcode);

    let response;
    try {
        // todo: update response for HP-ID
        response = HTTP.post('https://directory.stg.cd.id.hp.com/directory/v1/oauth/token', {
            headers: {
                Accept: 'application/json',
                Authorization: `Basic ${encodedAuthcode}`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },

            params: {
                grant_type: 'authorization_code',
                redirect_uri: `${OAuth._redirectUri('hpid', config)}`,
                code: query.code,
            },
        });

        //console.log('Response: %o', response);

    } catch (err) {
        throw Object.assign(
            new Error(`Failed to complete OAuth handshake with HP ID. ${err.message}`),
            {response: err.response},
        );
    }
    if (response.data.error) { // if the http response was a json object with an error attribute
        throw new Error(`Failed to complete OAuth handshake with HP ID. ${response.data.error}`);
    } else {
        //todo: remove logging
        // console.log('Token: ' + response.data.access_token);
        return response.data.access_token;
    }
};


const getIdentity = (accessToken) => {
    try {
        // console.log('Getting identity...');
        // console.log('Token: ' + accessToken);

        const encodedToken = encodeURIComponent(accessToken);  // for safety

        //console.log('Encoded Token: ' + encodedToken);


        const idString = HTTP.get('https://directory.stg.cd.id.hp.com/directory/v1/scim/v2/Me', {
            headers: {Authorization: `Bearer ${encodedToken}`},
        }).content;

        const idObject = JSON.parse(idString); //turn returned string into identity object

        console.log('\n\n*** IDENTITY RETURNED FROM HP ID *** \n %o', idObject);

        return idObject;

    } catch (err) {
        throw Object.assign(
            new Error(`Failed to fetch identity from HPID. ${err.message}`),
            {response: err.response},
        );
    }
};


Hpid.retrieveCredential = (credentialToken, credentialSecret) =>
    OAuth.retrieveCredential(credentialToken, credentialSecret);
