# Plant Watering Web App

[![Netlify Status](https://api.netlify.com/api/v1/badges/c63638d2-f8f2-412b-9a80-383f59f6918f/deploy-status)](https://app.netlify.com/sites/water-web-app/deploys)

A web application for remotely controlling and monitoring an IoT-based plant watering system.

## Features

- **Remote Watering Control**: Start and stop watering remotely
- **Customizable Duration**: Set watering duration from 1-60 seconds
- **Real-time Status**: Monitor connection status and device availability
- **Authentication**: Secure access with AWS Cognito
- **Responsive Design**: Works on mobile and desktop

## Technologies

- React + TypeScript
- AWS Amplify (Authentication)
- AWS IoT Core (MQTT)
- Zustand (State Management)
- Tailwind CSS (Styling)

## Setup

1. **Install dependencies**:

```
npm install
```

2. **Configure AWS**:

- Set up Cognito User Pool and Identity Pool

3. **Run locally**:

```
npm run dev
```

## IoT Configuration

New users require proper permissions to connect to AWS IoT:

1. Create an IoT policy
2. Attach the policy to your Cognito Identity Pool
3. More details [here](https://docs.amplify.aws/gen1/react/build-a-backend/more-features/pubsub/set-up-pubsub/#step-2-attach-your-policy-to-your-amazon-cognito-identity)

## Deployment

This app is configured for Netlify deployment:

```
 netlify deploy --prod
```

## Usage

1. Login with your credentials
2. Check device connectivity status
3. Set desired watering duration
4. Click "Start Watering" to begin
5. Monitor watering status in real-time
