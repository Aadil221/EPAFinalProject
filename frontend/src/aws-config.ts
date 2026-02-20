// Environment-based configuration
// Values are injected at build time via VITE_* environment variables
// Workflows will fetch these from CloudFormation outputs

const API_URL = import.meta.env.VITE_API_URL || '';
const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID || '';

export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID,
      userPoolClientId: USER_POOL_CLIENT_ID,
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    REST: {
      InterviewQuestionsAPI: {
        endpoint: API_URL,
        region: 'eu-west-1',
      },
    },
  },
};
