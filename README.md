# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


```
```
sbhq
├─ package-lock.json
├─ package.json
├─ Project-Specs.md
├─ public
│  ├─ android-chrome-192x192.png
│  ├─ android-chrome-512x512.png
│  ├─ apple-touch-icon.png
│  ├─ favicon-16x16.png
│  ├─ favicon-32x32.png
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ manifest.json
│  ├─ robots.txt
│  └─ site.webmanifest
├─ README.md
├─ src
│  ├─ assets
│  │  ├─ ball.gif
│  │  ├─ catch_nobg.gif
│  │  ├─ check.svg
│  │  ├─ DollarSignIcon.svg
│  │  ├─ gear.svg
│  │  ├─ hidepass.svg
│  │  ├─ leaderboard.svg
│  │  ├─ person.svg
│  │  ├─ triangle.svg
│  │  ├─ trophy.png
│  │  ├─ trophy.svg
│  │  └─ x.svg
│  ├─ components
│  │  ├─ admin
│  │  │  ├─ ContestDetail
│  │  │  │  ├─ InContestScreen.js
│  │  │  │  └─ InContestScreen.module.css
│  │  │  ├─ CreateContestModal
│  │  │  │  ├─ CreateContestModal.js
│  │  │  │  └─ CreateContestModal.module.css
│  │  │  ├─ InContest
│  │  │  │  ├─ CurrentQuestionView
│  │  │  │  │  ├─ CurrentQuestionView.js
│  │  │  │  │  └─ CurrentQuestionView.module.css
│  │  │  │  ├─ QuestionList
│  │  │  │  │  ├─ QuestionList.js
│  │  │  │  │  └─ QuestionList.module.css
│  │  │  │  ├─ QuestionModal
│  │  │  │  │  ├─ QuestionModal.js
│  │  │  │  │  └─ QuestionModal.module.css
│  │  │  │  ├─ StatCard
│  │  │  │  │  ├─ StatCard.js
│  │  │  │  │  └─ StatCard.module.css
│  │  │  │  └─ SubheaderToggles
│  │  │  │     ├─ SubheaderToggles.js
│  │  │  │     └─ SubheaderToggles.module.css
│  │  │  └─ Overview
│  │  │     ├─ OverviewScreen.js
│  │  │     └─ OverviewScreen.module.css
│  │  ├─ AnswerOption
│  │  │  ├─ AnswerOption.js
│  │  │  └─ AnswerOption.module.css
│  │  ├─ AnswersContainer
│  │  │  ├─ AnswersContainer.js
│  │  │  └─ AnswersContainer.module.css
│  │  ├─ AuthForm
│  │  │  ├─ AuthForm.js
│  │  │  └─ AuthForm.module.css
│  │  ├─ ContestCard
│  │  │  ├─ ContestCard.js
│  │  │  └─ ContestCard.module.css
│  │  ├─ CustomButton
│  │  │  ├─ LargeButton.js
│  │  │  └─ LargeButton.module.css
│  │  ├─ GameStatsSummary
│  │  │  ├─ GameStatsSummary.js
│  │  │  └─ GameStatsSummary.module.css
│  │  ├─ Header
│  │  │  ├─ Header.js
│  │  │  └─ Header.module.css
│  │  ├─ MainText
│  │  │  ├─ MainText.js
│  │  │  └─ MainText.module.css
│  │  ├─ PinInput
│  │  │  ├─ PinInput.js
│  │  │  └─ PinInput.module.css
│  │  ├─ PlayersList
│  │  │  ├─ PlayersList.js
│  │  │  └─ PlayersList.module.css
│  │  ├─ ProtectedRoute
│  │  │  └─ ProtectedRoute.js
│  │  ├─ SelectionIndicator
│  │  │  ├─ SelectionIndicator.js
│  │  │  └─ SelectionIndicator.module.css
│  │  ├─ SVG.js
│  │  └─ UsernameInput
│  │     ├─ UsernameInput.js
│  │     └─ UsernameInput.module.css
│  ├─ contexts
│  │  ├─ AuthContext.js
│  │  └─ UserContext.js
│  ├─ hooks
│  │  ├─ useCheckElimination.js
│  │  └─ useRequireState.js
│  ├─ index.css
│  ├─ index.js
│  ├─ logo.svg
│  ├─ reportWebVitals.js
│  ├─ screens
│  │  ├─ Admin
│  │  │  ├─ AdminScreen.js
│  │  │  └─ AdminScreen.module.css
│  │  ├─ Auth
│  │  │  ├─ AuthScreen.js
│  │  │  └─ AuthScreen.module.css
│  │  ├─ Correct
│  │  │  ├─ CorrectScreen.js
│  │  │  └─ CorrectScreen.module.css
│  │  ├─ Eliminated
│  │  │  ├─ EliminatedScreen.js
│  │  │  └─ EliminatedScreen.module.css
│  │  ├─ JoinContests
│  │  │  ├─ JoinContestsScreen.js
│  │  │  └─ JoinContestsScreen.module.css
│  │  ├─ Lobby
│  │  │  ├─ LobbyScreen.js
│  │  │  └─ LobbyScreen.module.css
│  │  ├─ Pregame
│  │  │  ├─ PregameScreen.js
│  │  │  └─ PregameScreen.module.css
│  │  ├─ Question
│  │  │  ├─ QuestionScreen.js
│  │  │  └─ QuestionScreen.module.css
│  │  ├─ Submitted
│  │  │  ├─ SubmittedScreen.js
│  │  │  └─ SubmittedScreen.module.css
│  │  └─ VerificationScreen
│  │     ├─ VerificationScreen.js
│  │     └─ VerificationScreen.module.css
│  ├─ setupTests.js
│  └─ supabase.js
└─ structure
   ├─ .project_structure_filter
   ├─ .project_structure_ignore
   └─ project_structure_filtered.txt

```