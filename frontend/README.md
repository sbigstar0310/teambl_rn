## Expo Go 환경 설정
https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated

## How to Start?
`npx expo start`

## Navigation
Folder `/app` contains all accessible pages (screens).
Each file in the folder should export corresponding UI component to be displayed.
The concept is similar to routing in NextJS. See [expo-router](https://docs.expo.dev/router/introduction/) for more details.

Screens (or routes) in `/app` folder is grouped into two:
- public:
  - Folder path: `/app/*`
  - Any file/folder that's not inside private group is considered public
  - Public screens are accessible by any user of the app without any authentication requirements
  - Can be used to display sign-in screen or other static screens
- private (authenticated required):
  - Folder path: `/app/(auth)`
  - User authentication is required to access these routes
  - The user identification is done on _layout.tsx file that's applied to all other files inside the `/app/(auth)` folder.

See [expo-router groups](https://docs.expo.dev/router/layouts/#groups) for more details.