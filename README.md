# react-extend-components
This package makes it easy to create components that are based on existing components, while handling prop merging, ref forwarding, and appropriate typing (with TypeScript), automatically.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Reasoning](#reasoning)
- [Customizing Props](#customizing-props)
- [Peeking](#peeking)
- [Handling Refs](#handling-refs)
- [Custom Components](#custom-components)
- [Merging Props / Refs](#merging-props--refs)

## Installation

```sh
$ npm install react-extend-components
```
## Basic Usage

First define a `ComponentExtenderGroup` that you will import in all of your component files.

```tsx
// in ComponentExtenders.ts
import { createComponentExtenderGroup } from 'react-extend-components';

export const ComponentExtenders = createComponentExtenderGroup();
```
Now you can start writing your components.

```tsx
import { ComponentExtenders } from './ComponentExtenders';

export const SubmitButton = ComponentExtenders.button(Button => {
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

export function Form(){
   const submitButtonRef = useRef<HTMLButtonElement>(null);
   return <>
      {/* ... */}
      <SubmitButton 
         ref={submitButtonRef} // ref is forwarded automatically
         style={{color: 'gray'}} // color style is overridden automatically
         // we can pass any prop we want to the button element without having to implement it in the component
         onClick={() => {
            // perform some click action
         }}
      /> 
      {/* ... */}
   </>
}
```

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
import { forwardRef } from 'react';

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
         ref={/* ... */} // merge theirRef and myRef somehow???
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
// in ComponentExtenders.ts

import { createComponentExtenderGroup } from 'react-extend-components';

export const ComponentExtenders = createComponentExtenderGroup();

// in Form.tsx

import { ComponentExtenders } from './ComponentExtenders';
import { useRef } from 'react';

export const SubmitButton = ComponentExtenders.button(Button => {
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

You might be wondering how you would add custom props to your component. Here's how you would do this.

```tsx
import { ComponentExtenders } from './ComponentExtenders';
import { ComponentType } from 'react';

export const SubmitButton = ComponentExtenders.button<{
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
import { ComponentExtenders } from './ComponentExtenders';

const HeaderView = ComponentExtenders.header(Header => {
   return <Header>
      <h1>My Awesome Header</h1>
   </Header>
});

<HeaderView>Custom Text</HeaderView> // TypeScript error! There is no children prop type associated with this component!
```
If you want to give users the ability to add a `children` prop, add it to your custom props type information.

```tsx
import { ComponentExtenders } from './ComponentExtenders';

const HeaderView = ComponentExtenders.header<{
   children?: string
}>((Header, { children }) => {
   return <Header>
      <h1>{children ?? 'My Awesome Header'}</h1>
   </Header>
});

<HeaderView>Custom Text</HeaderView> // 👍🏼 good to go
```

## Peeking

For whatever reason, you might want to have access to all the props that were passed to the component without preventing those props from being passed to the underlying element.

To do this, use the `helpers.peek` function.

```tsx
import { ComponentExtenders } from './ComponentExtenders';

const Link = ComponentExtenders.a((A, _, helpers) => {
   const { href } = helpers.peek(); // The underlying anchor element will still receive all the passed props (including href), but you can still 'peek' at the value.
   return <A className="app-link">
      My AwesomeLink
   </A>
});
```

## Handling Refs

When working with function components, React prevents you from treating a ref like you would a regular prop. You'd have to use forwardRef to access a ref that a user has passed to the component. This package attempts to reverse this and allow you to use a ref just like any other prop.

You can destructure a ref as you would expect.

```tsx
import { ComponentExtenders } from './ComponentExtenders';

const ListItemView = ComponentExtenders.div((
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
import { ComponentExtenders } from './ComponentExtenders';
import { useImperativeHandle } from 'react';

const DialogBox = ComponentExtenders.div<
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

By default, the `createComponentExtenderGroup` factory function gives you access to all the html elements listed in React's JSX.IntrinsicElements interface.

You're able to use them with this convenient syntax.

```tsx
// in ComponentExtenders.ts

import { createComponentExtenderGroup } from 'react-extend-components';

export const ComponentExtenders = createComponentExtenderGroup();

// in MyComponent.tsx

import { ComponentExtenders } from './ComponentExtenders';

export const MyComponent = ComponentExtenders.div( // or section, or form, or button, or any other html tag
   Div => {
      return <Div>{/* ... */}</Div>
   }
);
```

But you also have the ability to do the same with custom components that you've made yourself. The library makes this completely type-safe as well.

```tsx
import { ComponentExtenders } from './ComponentExtenders';
import { MainAppButton } from './MainAppButton';

export const MyComponent = ComponentExtenders(MainAppButton)(Button => {
   return <Button>{/* ... */}</Button>
})
```

Please note, however, that the types for all the props of the root element (`MainAppButton` in this case), are marked as optional by default. If you would like to require those props, add them to your [custom props](#customizing-props) generic parameter.

You can also define custom components in an `additionalComponents` object when creating your component extender so that you can access them on the extender using the same dot syntax that you would use for html elements.

```tsx
// in ComponentExtenders.ts

import { MainAppButton } from './MainAppButton';
import { createComponentExtenderGroup } from 'react-extend-components';

export const ComponentExtenders = createComponentExtenderGroup({
   MainAppButton
});

// in MyComponent.tsx

import { ComponentExtenders } from './ComponentExtenders';

export const MyComponent = ComponentExtenders.MainAppButton(
   Button => {
      return <Button />
   }
);
```

## Merging Props / Refs

When you pass the same prop to the resulting component as well as to the underlying element / component, the library has to figure out how to merge the two props. Here is how merging is handled for the various props.

- **The `style` prop:** The style properties passed to the outermost component will override the properties passed to the inner element.

```tsx
import { ComponentExtenders } from './ComponentExtenders';

export const MyButton = ComponentExtenders.button(Button => {
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
import { ComponentExtenders } from './ComponentExtenders';

export const MyButton = ComponentExtenders.button(Button => {
   return <Button className="My-Button">My Button</Button>
});

<MyButton className="some-other-class"/>

// the resulting className will look like this: 
// "My-Button some-other-class"
```
- **Refs:** The `ref` passed to the outermost component is merged with the `ref` passed to the inner element using the `mergeRefs` function that this library exports. This function works by returning a `RefCallback` that sets the ref value of all the refs when it is called by React.

- **Functions:** Functions are merged together by passing a new function to the prop that first calls the inner component function prop, then the outer one. The return value of the outer prop is the one that the function will return (if the outer prop is set).

```tsx
import { ComponentExtenders } from './ComponentExtenders';

export const MyButton = ComponentExtenders.button(Button => {
   return <Button 
      onClick={() => {
         // This function will be called first
         // It's return value is ignored if there is an outer function set. 
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
import { ComponentExtenders } from './ComponentExtenders';

export const MyButton = ComponentExtenders.button(Button => {
   return <Button 
      onClick={() => {
         // this function will never be called because the corresponding outer prop is a string and it will override this value
      }}
   >My Button</Button>
});

<MyButton 
   onClick={'foo' as any} // obviously you wouldn't do this for an html element but you could theoretically want to do something like this for a custom component
/>

// the props passed to the underlying button element are as follows: { onClick: "foo" }
```

- **The `children` prop:** The inner children prop will always override the outer prop if the inner prop is anything other than undefined.

```tsx
import { ComponentExtenders } from './ComponentExtenders';

export const MyButton = ComponentExtenders.button<{
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
import { ComponentExtenders } from './ComponentExtenders';

export const MyButton = ComponentExtenders.button<{
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
import { ComponentExtenders } from './ComponentExtenders';

export const MyButton = ComponentExtenders.button(Button => {
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

Here's how you would implement it.

```tsx
import { createComponentExtenderGroup } from 'react-extend-components';

export const ComponentExtenders = createComponentExtenderGroup({
   propsMergeFn: ({ 
      innerProps, 
      outerProps, 
      defaultMergeFn 
   }) => {
      const resultingProps = {/* ... */}
      // implement your custom merge strategy
      return resultingProps;
   },
});
```

You are provided with the `innerProps`, which are the props that were passed to the innermost element, and the `outerProps`, which are the props the users of your resulting component have passed to it.

Because refs are treated like regular props in this library, the `ref` passed to the outermost component will be included in `outerProps` and the `ref` passed to the inner component will be included in `innerProps`. This means you would be responsible for ensuring these are merged properly. You may use the `mergeRefs` function exported by this library if you so desire.

Similarly, you will also be responsible for merging the `children` props together.

Note that you will only receive props in the `outerProps` object that were not 'plucked' within the component.

You are provided with the `defaultMergeFn` in the merge function, which you may find useful if you'd just like to merge a specific prop but have the library handle the rest.

```tsx
import { createComponentExtenderGroup } from 'react-extend-components';

export const ComponentExtenders = createComponentExtenderGroup({
   propsMergeFn: ({ 
      innerProps, 
      outerProps, 
      defaultMergeFn 
   }) => {
      const resultingProps = defaultMergeFn({ 
         innerProps, 
         outerProps 
      });
      // customize the result a little bit
      return resultingProps;
   },
});
```

You can also specify a customized merge function at the individual component level.

```tsx
import { ComponentExtenders } from './ComponentExtenders';

const MyComponent = ComponentExtenders.div(Div => {
   return <Div></Div>
}, ({
   innerProps,
   outerProps,
   defaultMergeFn
}) => {
   const mergedProps = {/* ... */}
   /// customized merge implementation
   return 
});
```
This will, of course, override the merge function at the Component Extender level.