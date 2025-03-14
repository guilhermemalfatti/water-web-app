import { ResourcesConfig } from "@aws-amplify/core";

export const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-2_e0pLVMB6Z",
      userPoolClientId: "7u6pg7uj20190l38610jv4l3am",
      identityPoolId: "us-east-2:1719f9b7-ff9b-482f-a661-a35ba7a9ed72",
      signUpVerificationMethod: "code",
      loginWith: {
        email: true,
      },
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
    },
  },
};

// 123456aA*
