var docusign = require('docusign-esign'),
    async = require('async'),
    apiClient;

/**
 * Constructor - initilizes docusign connection
 */ 
function Docusign(demo, username, password, integratorKey) {
    // TODO null check params

    // initialize the api client
    apiClient = new docusign.ApiClient();

    // set the docusign environment to sandbox or production
    var docusignEnv = demo == true ? 'demo' : 'www';
    var baseUrl = 'https://' + docusignEnv + '.docusign.net/restapi';
    apiClient.setBasePath(baseUrl);

    // create JSON formatted auth header
    var creds = JSON.stringify({
      Username: username,
      Password: password,
      IntegratorKey: integratorKey
    });
    apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

    // assign api client to the Configuration object
    docusign.Configuration.default.setDefaultApiClient(apiClient);

    // login call available off the AuthenticationApi
    var authApi = new docusign.AuthenticationApi();

    // login has some optional parameters we can set
    var loginOps = {};
    loginOps.apiPassword = 'true';
    loginOps.includeAccountIdGuid = 'true';
    authApi.login(loginOps, function (err, loginInfo, response) {
        if (err) {
            return err;
        }
        if (loginInfo) {
            // list of user account(s)
            // note that a given user may be a member of multiple accounts
            var loginAccounts = loginInfo.loginAccounts;
            console.log('LoginInformation: ' + JSON.stringify(loginAccounts));
            var loginAccount = loginAccounts[0];
            var accountId = loginAccount.accountId;
            var baseUrl = loginAccount.baseUrl;
            var accountDomain = baseUrl.split("/v2");

            // below code required for production, no effect in demo (same domain)
            apiClient.setBasePath(accountDomain[0]);
            docusign.Configuration.default.setDefaultApiClient(apiClient);
        }
    });
}

Docusign.prototype.sendTemplate = function(envelopeRequest) {
    async.waterfall([
      function sendTemplate (loginAccount, next) {
        // create a new envelope object that we will manage the signature request through
        var envDef = new docusign.EnvelopeDefinition();
        envDef.emailSubject = 'Please sign this document sent from Node SDK';
        envDef.templateId = envelopeRequest.templateId;

        // create a template role with a valid templateId and roleName and assign signer info
        var tRole = new docusign.TemplateRole();
        tRole.roleName = envelopeRequest.templateRoleName;
        tRole.name = envelopeRequest.fullName;
        tRole.email = envelopeRequest.recipientEmail;

        // create a list of template roles and add our newly created role
        var templateRolesList = [];
        templateRolesList.push(tRole);

        // assign template role(s) to the envelope
        envDef.templateRoles = templateRolesList;

        // send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
        envDef.status = 'sent';

        // use the |accountId| we retrieved through the Login API to create the Envelope
        var accountId = loginAccount.accountId;

        // instantiate a new EnvelopesApi object
        var envelopesApi = new docusign.EnvelopesApi();

        // call the createEnvelope() API
        envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (err, envelopeSummary, response) {
          if (err) {
            return next(err);
          }
          console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
          next(null);
        });
      }

    ], function end (error) {
      if (error) {
        console.log('Error: ', error);
        return error;
      }
      return 'Successfully sent to DocuSign!';
    });    
};

module.exports = Docusign;