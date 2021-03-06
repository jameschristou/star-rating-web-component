# Star Rating Web Component
A star rating component built using web component technology making it usable with any front end framework or library.

![img](stars.png)

## Features
- Display star ratings with ability to specify number of stars, rating value and maximum value.
- Tested cross browser support down to IE11 (with webcomponents polyfill).
- Web component based and works with React, Angular and server side HTML.
- Very simple interface and open for style overrides.
- Responsive. You just set breakpoints for the container width and the component resizes the stars to fit the new width.

## Installation
This package is available from [npm](https://www.npmjs.com/package/@jchristou/star-rating-web-component). The package can be installed using 
```
npm install @jchristou/star-rating-web-component
```

## Usage
See the [example project](https://github.com/jameschristou/star-rating-web-component/tree/master/example). This uses the `npm` published version of the component.

### Default Styling
To include the default styling you import the SASS file
```js
import '@jchristou/star-rating-web-component/dist-component/StarRating.scss';
```

### Override Styling
You can choose not to use the provided styles and provide your own or you can also override the provided styles. An example of this is shown in the [example project](https://github.com/jameschristou/star-rating-web-component/tree/master/example) by examining [style.scss](https://github.com/jameschristou/star-rating-web-component/tree/master/example/src/style.scss).

### Responsive
The component listens for the window resize event and checks whether its container width has changed. If the container width has changed then it resizes the stars and spacing to fit the new width. This makes the component responsive.

## Browser Support
This component uses the Custom Element API as well as HTML Templates from the Web Components specification. Older browsers such as IE11 do not natively support this and so you will need to install the `@webcomponents/webcomponentsjs` polyfill package (this is done in the [example project](https://github.com/jameschristou/star-rating-web-component/tree/master/example)) to support these browsers. The component has been tested down to IE11 using this polyfill.

## Development
Run `npm install` to install all packages and depenedencies.

### Dev
To run dev server with HMR while developing use `npm run start`. This will run the project on http://localhost:8080 by default.

## Production Package Build
In order to build for pushing to `npm` you need to run `npm run build:component`. This will build the required package files into the `dist-component` folder. Running `npm publish` will then publish this to `npm`.