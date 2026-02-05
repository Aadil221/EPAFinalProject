export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-1_XZAczHudo',
      userPoolClientId: '7u27dv5quabpnlsqpprjknqr8v',
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    REST: {
      InterviewQuestionsAPI: {
        endpoint: 'https://g0g7y3878k.execute-api.eu-west-1.amazonaws.com/prod/',
        region: 'eu-west-1',
      },
    },
  },
};
