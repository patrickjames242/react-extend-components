# react-extend-components

This package makes it simple and intuitive to create reusable, customizable components that are based on existing components, while handling prop merging, ref forwarding, and typing (with TypeScript), automatically.

In essence, it allows you to easily 'extend' a component so that you 'inherit' all the existing props (and their implementation) while overriding some and adding your own.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Reasoning](#reasoning)
- [Customizing Props](#customizing-props)
   - [The `children` Prop](#the-children-prop)
   - [Overriding Base Component Prop Types](#overriding-base-component-prop-types)
- [Accessing Props](#accessing-props)
   - [The `props` argument](#the-props-argument)
   - [The `<Component>.props` object](#the-componentprops-object)
- [Handling Refs](#handling-refs)
- [Custom Components](#custom-components)
- [Adding Configurable Child Components](#adding-configurable-child-components)
- [Merging Props / Refs](#merging-props--refs)
   - [Custom Merging](#custom-merging)
- [Custom `extend` Functions](#custom-extend-functions)

## Installation

```sh
$ npm install react-extend-components
```
## Basic Usage

```tsx
import { extend } from 'react-extend-components';

export const SubmitButton = extend('button')(Button => {
   return <Button 
      className="SubmitButton" 
      style={{
         backgroundColor: 'blue',
         borderRadius: '10px',
         color: 'white'
      }}
   >
      Submit
   </Button>
})

<SubmitButton 
   className="some-class-name" // className is automatically appended to the one defined inside the component
   style={{color: 'gray'}} // color style is overridden automatically
   // we can pass any prop we want to the button element without having to implement it in the component
   onClick={() => {
      // perform some click action
   }}
/> 

```

### Adding custom props

```tsx
import { extend } from 'react-extend-components';

export const NavMenu = extend('div')<{
   text: string; // 1. define the type of your custom props
}>((Div, { text }) => { // 2. destructure the props you want to use here. 
   return <Div>{text}</Div>
})

// Any prop you destructure will not be passed to the underlying div. All other props are.

<NavMenu text="My Nav Menu" />
```

Learn more [here](#customizing-props)

### Automatic Ref Merging

```tsx
import { extend } from 'react-extend-components';
import { useRef } from 'react';

export const HeaderView = extend('div')(Div => { 
   // you can add a ref in here...
   const ref = useRef<HTMLDivElement>(null);
   return <Div ref={ref}>{text}</Div>
})

function App(){
   // ...and here!
   const ref = useRef<HTMLDivElement>(null);
   return <HeaderView ref={ref}/> 
}
// No worries, your refs are merged together automatically. You don't even have to think about it!
```

### Defining Custom Refs
```tsx
import { extend } from 'react-extend-components';
import { useImperativeHandle } from 'react';

const DialogBox = extend('div')<
   {},
   { // 1. add the type of the ref as the second generic parameter
      setOpened: (isOpen: boolean) => void; 
   } 
>((
   Div, 
   { ref } // 2. destructure the ref so it won't be passed to the underlying element
) => {
   // 3. add your implementation
   useImperativeHandle(ref, () => ({
      setOpened: (isOpened) => {
         // implementation...
      }
   }), []);

   return <Div className="dialog-box">
      {/* ... */}
   </Div>
});
```
Learn more [here](#handling-refs)

### Extending Custom Components

```tsx
import { extend } from 'react-extend-components';
import { MainAppButton } from './MainAppButton';

export const MyComponent = extend(MainAppButton)(Button => {
   return <Button>{/* ... */}</Button>
})
```

Learn more [here](#custom-components)

### Configurable Child Components

```tsx
import { extend } from 'react-extend-components';

const HeaderView = extend('div', { LogOutButton: 'button' })(
   (Div, { LogOutButton }) => {
      return (
         <Div>
            <LogOutButton 
               onClick={() => {/* ... */}}
            >Log Out</LogOutButton>
         </Div>
      );
   }
);

<HeaderView
   logOutButtonProps={{
      // all props we pass in here will be passed to the log out button
      style: { color: 'red' },
      onClick: () => {
         // log out
      },
   }}
/>;
```

Learn more [here](#adding-configurable-child-components)

## Reasoning

Sometimes when we create components that are based on other components (like HTML elements), we'd like to give the user of the component the ability to customize the props of the underlying element. Here is how this is often accomplished in normal React components.

```tsx
function SubmitButton({
   className, 
   style, 
   ...props
}: HTMLAttributes<HTMLDivElement>){
   return <button 
      {...props}
      className={"submit-button " + (props.className ?? '')}
      style={{
         backgroundColor: 'gray',
         ...style
      }}
   >
      Submit
   </button>
}
```

Here we're giving users the ability to set any prop for our underlying button element, and if they happen to set the `className` or `style` props, we simply merge their values with the values set within the component.

This seems easy enough. But what if the user wanted to add an `onClick` listener and an `onMouseUp` listener to the component and we're already using those within the component? We'd have to merge those two functions as well.

```tsx
function SubmitButton({
   className, 
   style, 
   onClick, 
   onMouseUp, 
   ...props
}: HTMLAttributes<HTMLDivElement>){
   return <button 
      {...props}
      className={"submit-button" + (props.className ?? '')}
      style={{
         backgroundColor: 'gray',
         ...style
      }}
      onMouseUp={(e) => {
         // perform our own action
         onMouseUp?.(e);
      }}
      onClick={(e) => {
         // perform our own action
         onClick?.(e);
      }}
   >
      Submit
   </button>
}
```

If users also needed to access the ref of the underlying button element, our example gets even more complicated (especially if we were already using a ref within the component).

```tsx
import { forwardRef, useRef } from 'react';

const SubmitButton = forwardRef<
   HTMLDivElement, 
   HTMLAttributes<HTMLDivElement>
>(
   ({
      className, 
      style, 
      onClick, 
      onMouseUp, 
      ...props
   }, theirRef) => {
      const myRef = useRef<HTMLDivElement>(null);
      return <button 
         {...props}
         ref={/* ... */} // merge theirRef and myRef somehow? ¯\_(ツ)_/¯ 
         className={"submit-button" + (props.className ?? '')}
         style={{
            backgroundColor: 'gray',
            ...style
         }}
         onMouseUp={(e) => {
            // perform our own action
            onMouseUp?.(e);
         }}
         onClick={(e) => {
            // perform our own action
            onClick?.(e);
         }}
      >
         Submit
      </button>
   }
)
```

It's easy to see how a such a simple component could easily become much more complicated and verbose when having to support this sort of functionality. And having to write so much boilerplate code for every component can be very tedious and lead to bugs.

The purpose of this package is to take care of all of this automatically, and allow you define and use components as you normally would, without worrying about merging props and forwarding refs.

Here's how you would rewrite the above component using this package.

```tsx
import { extend } from 'react-extend-components';
import { useRef } from 'react';

export const SubmitButton = extend('button')(Button => {
   const buttonRef = useRef<HTMLButtonElement>(null);
   return <Button 
      ref={buttonRef}
      className="submit-button"
      style={{
         backgroundColor: 'gray',
      }}
      onMouseUp={() => {
         // perform our own action
      }}
      onClick={() => {
         // perform our own action
      }}
   >
      Submit
   </Button>
})

export function Form(){
   const submitButtonRef = useRef<HTMLButtonElement>(null);
   return <>
      {/* ... */}
      <SubmitButton 
         // the ref is automatically forwarded to the underlying element
         ref={submitButtonRef} 
         // the className is automatically appended to the root element's className
         className="some-additional-class"
         // the backgroundColor style is overridden automatically
         style={{backgroundColor: 'white'}} 
         // we automatically have access to any prop we want
         onClick={() => {
            // add our own action here
         }}
         onMouseUp={() => {
            // add our own action here
         }}
      /> 
      {/* ... */}
   </>
}
```

Here, we can add a ref to the button inside the component as well as outside the component without having to worry about forwarding the ref or merging the two refs together. 

Also, the library automatically gives the users of the component access to the all the props of the underlying component and merges those with the props provided within the component.

## Customizing Props

When we 'extend' the props of another component, most times we would also want to add a few additional props of our own. Here's how you would do this.

```tsx
import { extend } from 'react-extend-components';
import { ComponentType } from 'react';

export const SubmitButton = extend('button')<{
   buttonTitle: string;
   Icon?: ComponentType<{className?: string}>
}>((Button, { buttonTitle, Icon }) => {

   return <Button className="submit-button">
      { buttonTitle ?? 'Submit' }
      <Icon className="submit-button-icon">
   </Button>

});

<SubmitButton
   Icon={MyIcon}
   buttonTitle="Submit"
   onClick={() => {
      // perform some action
   }}
/>
```

Here we're destructuring certain props that were provided to the outermost component for use within our component. Whatever props you destructure / access in the props argument will be hidden from the underlying element. This will prevent pesky errors from React as well as prevent unexpected behavior if your prop names conflict with HTML attribute names. (The package uses getters within the props object to figure out which props you're using within your component.)

Additionally, the `props` argument doesn't restrict you to properties you've defined yourself. You can access any prop the user passes to the outermost component, even refs!

Note that if any of your custom prop names clash with the base element's prop names (`button` in the above case), then the types of your custom props will override that of the base element.

### The `children` Prop

By default, the `children` prop is excluded from the type information of the resulting component. This is because, usually, components would want to add their own children to the underlying element or have specific control over how values provided to `children` are dealt with.

```tsx
import { extend } from 'react-extend-components';

const HeaderView = extend.header(Header => {
   return <Header>
      <h1>My Awesome Header</h1>
   </Header>
});

<HeaderView>Custom Text</HeaderView> // ❌ TypeScript error! There is no children prop type associated with this component!
```
If you want to give users the ability to add a `children` prop, add it to your custom props type information.

```tsx
import { extend } from 'react-extend-components';

const HeaderView = extend.header<{
   children?: string
}>((Header, { children }) => {
   return <Header>
      <h1>{children ?? 'My Awesome Header'}</h1>
   </Header>
});

<HeaderView>Custom Text</HeaderView> // 👍🏼 good to go
```

### Overriding Base Component Prop Types

When you extend a base element / component, the resulting component 'inherits' all the prop types from the base component automatically. So outsiders can override any of the props of the base component if they wanted to (only for [those props](#merging-props--refs) that aren't merged by default). In doing this, they could accidentally change critical functionality within your component. For example: 

```tsx
import { extend } from 'react-extend-components';

const FileInput = extend.input((Input) => {
   return <Input type="file" />
});

<FileInput type="text" /> // this "type" prop will override the one defined within the component, changing the input from a file field to a text field.
```

To prevent this, you may want to alter the props that are made available from the base component to the resulting component. Here's how you can do this.

```tsx
import { extend } from 'react-extend-components';
import { ComponentProps } from 'react';

const FileInput = extend.input<
  {},
  'default', // Tells the function to use the default method of figuring out the type of the ref. This is the default value if you don't set it. We're only setting it here because we need to set the third generic parameter.
  keyof Omit<ComponentProps<'input'>, 'type'> // here we can specify a list of keys to include from the base component. Only keys specified in this union are included from the base component. (Only known keys are included)
>((Input) => {
  return <Input type="file" />;
});

<FileInput type="text" /> // ❌ TypeScript error! This component doesn't expose a "type" prop type!
```

## Accessing Props

### The `props` argument

Normally you would access the props passed to the resulting component with the `props` object argument in your component as follows:

```tsx
import { extend } from 'react-extend-components';

const MyComponent = extend('div')((
   Div, 
   props // <- all the props that were passed to the component
) => {
   console.log(props.title); // react-extend-components rocks!!
   return <Div></Div>
});

<MyComponent title="react-extend-components rocks!!"/>
```

However, there is a little more to this `props` object than meets the eye. If you actually ran the above code in the browser and inspected the div element this component renders, you would find that it doesn't actually have a title attribute. 

But if you removed the `console.log(props.title)` statement and ran the code again, suddenly the div element magically has a title attribute! What gives?

```tsx
import { extend } from 'react-extend-components';

const MyComponent = extend('div')((Div, props) => {
   //console.log(props.title); <- this prevented the div from having a title attribute, but removing it causes the title attribute to appear
   return <Div></Div>
});

<MyComponent title="react-extend-components rocks!!"/>
```

The reasoning for this is that when you access any prop from the props argument, it is assumed that you are going to fully manage how that prop is handled and eventually passed to the root element / component if needed.

The library can't simply pass all the props received to the underlying element because this would mean custom props you've defined would always be passed to the HTML element as an attribute. In most cases this would cause React to complain with an error about invalid HTML attributes, and if your custom prop names clash with HTML attributes, this would result in unwanted / unexpected behavior. So the library has to figure out which props you actually use within the component, then only include them in the resulting component if you explicitly set them. 

This is made possible because the `extend` function doesn't simply pass you the same props object React passes it. It passes you a new object with a getter for every prop the user passed to the component. Whenever you access any prop via dot notation or destructuring, the component makes a note of this and 'hides' those specific props from the underlying element / component (unless you set them explicitly), while passing all the other props down normally.

In summary, be aware that when you access any prop from the `props` object, you are entirely responsible for making sure that specific prop is passed to the base component / element.

### Be Careful Where You Access Props

An important implication of the way the `props` object is implemented is that the default functionality only works if you access props within the execution of the render function itself. If you access a prop in an effect or some other function that is executed after the render function returns, there is no guarantee that the prop will be 'hidden' as described above.

```tsx
import { extend } from 'react-extend-components';
import { useEffect } from 'react';

const MyComponent = extend('div')<{
   someCustomProp: string;
}>((Div, props) => {

   useEffect(() => {
      const value = props.someCustomProp; // ❌ Don't do this! 
   }, []);

   return <Div></Div>
});

<MyComponent someCustomProp="patrick" />
```

In the above example, `someCustomProp` will still be passed to the underlying div element and React will give us an error stating that this is an unknown attribute for div elements. 

To fix this, grab a reference to the prop in the render function via destructuring or a variable.

```tsx
import { extend } from 'react-extend-components';
import { useEffect } from 'react';

const MyComponent = extend('div')<{
   someCustomProp: string;
}>((
   Div, 
   { someCustomProps } // ✅ Perfect! prop won't be passed to the underlying element
) => { 
   useEffect(() => {
      const value = someCustomProp; 
   }, []);
   return <Div></Div>
});

// or...

const MyComponent2 = extend('div')<{
   someCustomProp: string;
}>((Div, props) => { 
   const someCustomProp = props.someCustomProp; // ✅ Awesome! we're accessing the prop in the render function so it won't be passed to the underlying element!
   useEffect(() => {
      const value = someCustomProp; 
   }, []);
   return <Div></Div>
});

```
### The `<Component>.props` object

For every root or child component provided to you in the render function, you can access a `props` object via dot notation. This `props` object has useful functions you can call as alternatives to utilizing the `props` parameter in the render function. 

```tsx
import { extend } from 'react-extend-components';

const SideBar = extend('div', {openCloseButton: 'button'})(
   (Div, {OpenCloseButton}) => {

      const rootPropsHelpers = Div.props; 
      const buttonPropsHelpers = OpenCloseButton.props; 

      return <Div>
         <OpenCloseButton />
      </Div>
   }
);
```

### `<Component>.props.peek`

For whatever reason, you might want to have access to all the props that were passed to the component without preventing those props from being passed to the underlying element.

To do this, use the `<Component>.props.peek` function.

```tsx
import { extend } from 'react-extend-components';

const Link = extend('a')((A) => {
   const { href } = A.props.peek(); // The underlying anchor element will still receive all the passed props (including href), but you can still 'peek' at the value.
   return <A className="app-link">
      My AwesomeLink
   </A>
});
```

### `<Component>.props.pluck`

In some circumstances you may find the default 'magical' functionality of the `props` parameter cumbersome, so the `<Component>.props.pluck` function allows you to explicitly specify the props you want to be hidden from the underlying element and returns only those props in the returned object. 

Note that the function hides all the props you specify, regardless of whether or not you access them in the resulting object.

```tsx
import { extend } from 'react-extend-components';

const Link = extend('a')<{
   myCustomProp1: string;
   myCustomProp2: number;
}>((A) => {
   const { myCustomProp1, myCustomProp2 } = A.props.pluck(
      'myCustomProp1',
      'myCustomProp2'
   ); // myCustomProp1 and myCustomProp2 will be hidden from the anchor element
   return <A className="app-link">
      My AwesomeLink
   </A>
});
```

### `<Component>.props.pluckAll`

This function hides all props passed to your component from the underlying base component by default, and returns all those props in its object return value. In this case you would have to handle the passing of those props to the component yourself.

```tsx
import { extend } from 'react-extend-components';

const Link = extend('a')((A) => {
   const allProps = A.props.pluckAll(); // Now no props will be passed to the anchor element automatically. We have to pass them ourselves.
   return <A {...allProps}>
      My AwesomeLink
   </A>
});
```

### `<Component>.props.detectPlucked`

This function is essentially the same magic behind the `props` parameter. It wraps all the props provided to the component in a getter which can detect which one you're accessing within the component and hide it from the base component by default.

```tsx
import { extend } from 'react-extend-components';

const Link = extend('a')<{
   myCustomProp: string;
}>((A) => {
   const { myCustomProp } = A.props.detectPlucked(); // myCustomProp will be hidden from the anchor element because we're accessing it, but all other props will be passed on normally.
   return <A className="app-link">
      My AwesomeLink
   </A>
});
```

This is actually what `extend` uses under the hood to provide you with the `props` parameter.

## Handling Refs

When working with function components, React prevents you from treating a ref like you would a regular prop. You'd have to use forwardRef to access a ref that a user has passed to the component. This package attempts to reverse this and allow you to use a ref just like any other prop.

You can destructure a ref as you would expect.

```tsx
import { extend } from 'react-extend-components';

const ListItemView = extend('div')((
   Div, 
   { ref } // now the ref won't be passed to the underlying element
) => {
   return <Div className="list-item-view">
      {/* ... */}
   </Div>
});
```

Here's how you would implement a custom ref.

```tsx
import { extend } from 'react-extend-components';
import { useImperativeHandle } from 'react';

const DialogBox = extend('div')<
   {}, // add custom prop types here
   { // add the type of the ref as the second generic parameter
      setOpened: (isOpen: boolean) => void; 
   } 
>((
   Div, 
   { ref } // destructure the ref so it won't be passed to the underlying element
) => {
   useImperativeHandle(ref, () => ({
      setOpened: (isOpened) => {
         // implementation...
      }
   }), []);

   return <Div className="dialog-box">
      {/* ... */}
   </Div>
});
```

## Custom Components

By default, the `extend` function gives you access to all the HTML elements listed in React's JSX.IntrinsicElements interface.

You're able to use them with this convenient syntax.

```tsx
import { extend } from 'react-extend-components';

export const MyComponent = extend('div')( // or section, or form, or button, or any other HTML tag
   Div => <Div>{/* ... */}</Div>
);

// or...

export const MyComponent = extend.div( // or section, or form, or button, or any other HTML tag
   Div => <Div>{/* ... */}</Div>
);
```

But you also have the ability to do the same with custom components that you've made yourself. The library makes this completely type-safe as well.

```tsx
import { extend } from 'react-extend-components';
import { MainAppButton } from './MainAppButton';

export const MyComponent = extend(MainAppButton)(Button => {
   return <Button>{/* ... */}</Button>
})
```

Please note, however, that the types for all the props of the root element (`MainAppButton` in this case), are marked as optional by default. If you would like to require those props, add them to your [custom props](#customizing-props) generic parameter.

## Adding Configurable Child Components

An additional use case that this library covers is the ability to customize components that are children of the root component.

For example, if you have a `HeaderView` component with a log out button inside it, you may want to allow users to customize the props passed to that button from the `HeaderView` component itself. 

Here's how you would accomplish this.

```tsx
import { extend } from 'react-extend-components';

const HeaderView = extend(
   'div', 
   { // 1. define a child components object with labels for your components and the components themselves
      LogOutButton: 'button' // you may specify a string for an HTML element or a component function or class.
   } 
)((
   Div, 
   { LogOutButton } // this is an object mapping capitalized labels from your definition object to components that you will use within the render function
) => {
   return (
      <Div>
         { /* use the component / element as you normally would in here */}
         <LogOutButton 
            onClick={() => {/* ... */}}
         >Log Out</LogOutButton>
      </Div>
   );
});

<HeaderView
   // You are automatically given access to this prop, and its name depends 
   // on the label you provided for it in the definition above.
   // It is made type-safe using TypeScript template literal magic 😬
   logOutButtonProps={{
      // all props we pass in here will be passed to the log out button
      style: { color: 'red' },
      onClick: () => {
         // log out
      },
   }}
/>;
```

You may add as many child components as you like, provided each one has a different label. 

Note that the labels for all components in the `childComponents` render function argument are altered so that their first letters are always capitalized. Likewise, the prop you set on the resulting component to customize child components should always have its first letter 'uncapitalized'.

Props passed to child components from outside the component and inside the component are merged in the same way they are for the root component. Read more about prop merging [here](#merging-props--refs).

## Merging Props / Refs

When you pass the same prop to the resulting component as well as to the underlying element / component, the library has to figure out how to merge the two props. Here is how merging is handled for the various props.

- **The `style` prop:** The individual style properties passed to the outermost component will override the properties passed to the inner element.

```tsx
import { extend } from 'react-extend-components';

export const MyButton = extend.button(Button => {
   return <Button style={{
      backgroundColor: 'purple',
      color: 'white',
   }}>My Button</Button>
});

<MyButton style={{
   backgroundColor: 'red',
}}/>

// the resulting style will look like this: 
// {
//    backgroundColor: 'red',
//    color: 'white',
// }
```
- **The `className` prop:** The className string passed to the outermost component is appended to the className string passed to the inner element.
```tsx
import { extend } from 'react-extend-components';

export const MyButton = extend.button(Button => {
   return <Button className="My-Button">My Button</Button>
});

<MyButton className="some-other-class"/>

// the resulting className will look like this: 
// "My-Button some-other-class"
```
- **Refs:** The `ref` passed to the outermost component is merged with the `ref` passed to the inner element using the `mergeRefs` function that this library exports. This function works by returning a `RefCallback` that sets the ref value of all the refs when it is called by React. (There is some debate that this is an inferior method of merging refs because it results in callback refs being called on every render; however, there are issues with other implementations. Check out [this Github issue](https://github.com/gregberge/react-merge-refs/issues/5) for an in-depth discussion.)

- **Functions:** Functions are merged together by passing a new function to the prop that first calls the inner component function prop, then the outer one. The return value of the outer prop is the one that the function will return (if the outer prop is set).

```tsx
import { extend } from 'react-extend-components';

export const MyButton = extend('button')(Button => {
   return <Button 
      onClick={() => {
         // This function will be called first
         // It's return value is ignored if there is an outer function is set. 
         // If not, this return value is returned from the resulting callback
      }}
   >My Button</Button>
});

<MyButton 
   onClick={() => {
      // This function is called second
      // Any value returned here will be returned from the actual callback
   }}
/>
```

Please note that in a situation where either the inner prop or outer prop is a function and the other one is a non-function (with the exception of null and undefined), the outer prop will always replace the inner one.

```tsx
import { extend } from 'react-extend-components';

export const MyButton = extend.button(Button => {
   return <Button 
      onClick={() => {
         // this function will never be called because the corresponding outer prop is a string and it will override this value
      }}
   >My Button</Button>
});

<MyButton 
   onClick={'foo' as any} // obviously you wouldn't do this for an HTML element but you could theoretically want to do something like this for a custom component
/>

// the props passed to the underlying button element are as follows: { onClick: "foo" }
```

- **The `children` prop:** The inner children prop will always override the outer prop if the inner prop is anything other than undefined.

```tsx
import { extend } from 'react-extend-components';

export const MyButton = extend.button<{
   children?: string
}>(Button => {
   return <Button>
      My Button {/* If specified, this value will override any children prop provided in the outer props */}
   </Button>
});

<MyButton>
   My Customized Title {/* This value will be ignored because the inner children prop has been specified */}
</MyButton>

// the resulting children value will be: "My Button"
```

If you would like to allow users to customize the children of the component, destructure the `children` prop and incorporate it into the component.

```tsx
import { extend } from 'react-extend-components';

export const MyButton = extend.button<{
   children?: string
}>((Button, { children }) => {
   return <Button>
      { children ?? 'My Button'}
   </Button>
});

<MyButton>
   My Customized Title
</MyButton>

// the resulting children value will be: "My Customized Title"
```

- **Any Other Prop:** For any other prop, the outer props will override the inner props.
```tsx
import { extend } from 'react-extend-components';

export const MyButton = extend('button')(Button => {
   return <Button 
      title="My Button" // this value will be ignored 
   >My Button</Button>
});

<MyButton 
   title="My Favorite Button" // the outer prop takes precedence
/>

// the resulting button title will be "My Favorite Button"

```

### Custom Merging

You are given the option to implement a custom merge function if the provided merge functionality is insufficient. 

#### The Merge Function

```tsx
import { PropsMergeFn } from 'react-extend-components';

const mergeFunction: PropsMergeFn = ({
  innerProps,
  outerProps,
  label,
  type,
  defaultMergeFn,
}) => {
  const resultingProps = {/* ... */}
  // implement your custom merge strategy
  return resultingProps;
};
```

Here are the arguments provided to you in the merge function.

| Argument | Description |
| --- | --- |
| `innerProps` | The props that were passed to the underlying component / element within the component declaration.
| `outerProps` | The props that were passed to the outermost component by the users of your component. Only props that were not accessed via the [`props`](#accessing-props) argument or [plucked](#componentpropspluck) will be provided in this object.
| `label` | The label of the component being merged. This refers either to the label you provided for a child component in the childComponents object, or "root" for the root component.
| `type` | The type of the component that is provided to React. In the case of HTML elements, it will be the string form of the element, like 'div', 'button' or 'a'. For components it will be the component class or function.
| `defaultMergeFn` | This is the function the library uses by default to merge your props. You may use this if you'd like to merge specific props but have the library handle the rest.

Because refs are treated like regular props in this library, the `ref` passed to the outermost component will be included in `outerProps` and the `ref` passed to the inner component will be included in `innerProps`. This means the merge function is responsible for ensuring these are merged properly. You may use the `mergeRefs` function exported by this library if you so desire.

Similarly, the merge function would also be responsible for merging the `children` props together.

Note that the merge function will only receive props in the `outerProps` object that were not accessed via the `props` argument or 'plucked' within the component.

Here is an example of usage of the `defaultMergeFn` argument.

```tsx
import { PropsMergeFn } from 'react-extend-components';

const mergeFunction: PropsMergeFn = ({
  innerProps,
  outerProps,
  label,
  type,
  defaultMergeFn,
}) => {
   const resultingProps = defaultMergeFn({ 
      innerProps, 
      outerProps 
   });
   // customize the result a little bit
   return resultingProps;
};
```


#### Global Merge Function

To set a global merge function for your entire app, add a `MergeFunctionProvider` at the top of your React tree that provides the merge function for all of your extended components.

The `MergeFunctionProvider` only provides a merge function for the components that don't already have a merge function explicitly set and those that weren't produced with a [custom extend function](#custom-extend-functions).

```tsx
import { extend, MergeFunctionProvider } from 'react-extend-components';

const MyButton = extend('button')(Button => <Button />)

<MergeFunctionProvider
   propsMergeFn={
      ({ 
         innerProps, 
         outerProps, 
         defaultMergeFn 
      }) => {
         const resultingProps = {/* ... */}
         // implement your custom merge strategy
         return resultingProps;
      }
   }
>
   <MyButton />
</MergeFunctionProvider>
```
#### Per-Component Merge Function

You may override the global or default merge function on a per-component basis.

```tsx
import { extend, MergeFunctionProvider } from 'react-extend-components';

const MyButton = extend('button')(
   Button => <Button />,
   ({ innerProps, outerProps }) => {
      const mergedProps = {/* ... */}
      /// customized merge implementation
      return 
   }
)
```

## Custom `extend` Functions

The library gives you the option of creating your own `extend` functions. There are two main benefits of doing this.

- It allows you to implement a specific merge function for certain components within your apps which will override the default or global merge function. This might be useful if you are writing a component library and don't want to allow users to alter the way your props are merged with a `MergeFunctionProvider`.

- It allows you to add additional components to the function that can be accessed via dot syntax. If you have a few custom components in your app that you extend frequently, this saves you from having to import those components every time you extend them.

```tsx
import { createCustomComponentExtender } from 'react-extend-components';

function MyCustomButton() {
  return <button></button>;
}

const customExtend = createCustomComponentExtender({
   additionalComponents: {
      MyCustomButton,
   },
   propsMergeFn: ({ innerProps, outerProps }) => {
      return { /* ... */ };
   },
});

const MyExtendedCustomButton = customExtend.MyCustomButton(
   Button => <Button />
)
```

Note that if you don't specify any merge function, the resulting extend function will use the merge function from the `MergeFunctionProvider` if present. If you would like to always have your components use the default merge function but not be affected by the `MergeFunctionProvider`, explicitly specify the default merge function in your `createCustomComponentExtender` function call.

```tsx
import { 
   createCustomComponentExtender,
   defaultPropsMergeFn
} from 'react-extend-components';

const customExtend = createCustomComponentExtender({
   propsMergeFn: defaultPropsMergeFn,
});

// now all components created with this custom extend function will be unaffected by the MergeFunctionProvider
```
