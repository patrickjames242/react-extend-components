# react-extend-components
This package makes it easy to create components that are based on existing components, while handling prop merging, ref forwarding, and appropriate typing (with TypeScript), automatically.

Here's an example of basic usage. 

```tsx
// in ComponentBuilders.ts

import { createComponentBuilderGroup } from 'react-extend-components';

export const ComponentBuilders = createComponentBuilderGroup();

// in Form.tsx

import { ComponentBuilders } from './ComponentBuilders';

export const SubmitButton = ComponentBuilders.button(Button => {
   return <Button style={{
      backgroundColor: 'blue',
      borderRadius: '10px',
      color: 'white'
   }}>
      Submit
   </Button>
})

export function Form(){
   return <>
      {/* ... */}
      <SubmitButton 
         style={{color: 'gray'}} // color style is overridden automatically
      /> 
      {/* ... */}
   </>
}

```

## Reasoning

Sometimes when we create components that are based on other components (like HTML elements), we'd like to give the user of the component the ability to customize the props of the underlying element. Here is how this is often accomplished.

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

Here we're giving users the ability to set any prop for our underlying button element, and if they happen to set the `className` or `style` props, we simply merge their values with ours.

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
// in ComponentBuilders.ts

import { createComponentBuilderGroup } from 'react-extend-components';

export const ComponentBuilders = createComponentBuilderGroup();

// in Form.tsx

import { ComponentBuilders } from './ComponentBuilders';
import { useRef } from 'react';

export const SubmitButton = ComponentBuilders.button(Button => {
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
         // the ref is automatically forwarded to the underlying component
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
import { ComponentBuilders } from './ComponentBuilders';
import { ComponentType } from 'react';

export const SubmitButton = ComponentBuilders.button<{
   buttonTitle: string;
   Icon?: ComponentType<{className?: string}>
}>((Button, props) => {
   const { buttonTitle, Icon } = props.pluck(
      // completely type-safe, you can only specify known properties
      'buttonTitle', 
      'Icon'
   ); 
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

Here we're 'plucking' certain props that were provided to the outermost component for use within our component. Whatever props you pass to the `props.pluck` will be hidden from the underlying element. This will prevent pesky errors from react as well as prevent unexpected behavior if your prop names conflict with html attribute names.

Additionally, `props.pluck` doesn't restrict you to properties you defined yourself. You can pluck any prop the user passes to the outermost component, even refs!

### The `children` Prop

By default, the `children` prop is excluded from the type information of the resulting component. This is because, usually, components would want to add their own children to the underlying element or have specific control over how values provided to `children` are dealt with.

```tsx
import { ComponentBuilders } from './ComponentBuilders';

const HeaderView = ComponentBuilders.header(Header => {
   return <Header>
      <h1>My Awesome Header</h1>
   </Header>
});

<HeaderView>Custom Text</HeaderView> // TypeScript error! There is no children prop type associated with this component!
```
If you want to give users the ability add a `children` prop, add it to your custom props type information.

```tsx
import { ComponentBuilders } from './ComponentBuilders';

const HeaderView = ComponentBuilders.header<{
   children?: string
}>((Header, props) => {
   const { children } = props.pluck('children');
   return <Header>
      <h1>{children ?? 'My Awesome Header'}</h1>
   </Header>
});

<HeaderView>Custom Text</HeaderView> // 👍🏼 good to go
```

## Peeking

For whatever reason, you might want to have access to all the props that were passed to the component without preventing those props from being passed to the underlying element.

To do this, use the `props.peek` function.

```tsx
import { ComponentBuilders } from './ComponentBuilders';

const Link = ComponentBuilders.a((A, props) => {
   const { href } = props.peek(); // The underlying anchor element will still receive all the passed props (including href), but you can still 'peek' at the value.
   return <A className="app-link">
      My AwesomeLink
   </A>
});
```

## Handling Refs

When working with function components, React prevents you from treating a ref like you would a regular prop. You'd have to use forwardRef to access a ref that a user has passed to the component. This package attempts to reverse this and allow you to use a ref just like any other prop.

You can pluck a ref as you would expect.

```tsx
import { ComponentBuilders } from './ComponentBuilders';

const ListItemView = ComponentBuilders.div((Div, props) => {
   
   const { ref } = props.pluck('ref') // now the ref won't be passed to the underlying element
   
   return <Div className="list-item-view">
      {/* ... */}
   </Div>
});
```

Here's how you would implement a custom ref.

```tsx
import { ComponentBuilders } from './ComponentBuilders';
import { useImperativeHandle } from 'react';

const DialogBox = ComponentBuilders.div<
   {}, // add custom prop types here
   { // add the type of the ref as the second generic parameter
      setOpened: (isOpen: boolean) => void; 
   } 
>((Div, props) => {
   const { ref } = props.pluck('ref'); // pluck the ref so it won't be passed to the underlying element
   
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

By default, the `createComponentBuilderGroup` factory function gives you access to all the html elements listed in React's JSX.IntrinsicElements interface.

You're able to use them with this convenient syntax.

```tsx
// in ComponentBuilders.ts

import { createComponentBuilderGroup } from 'react-extend-components';

export const ComponentBuilders = createComponentBuilderGroup();

// in MyComponent.tsx

import { ComponentBuilders } from './ComponentBuilders';

export const MyComponent = ComponentBuilders.div( // or section, or form, or button, or any other html tag
   Div => {
      return <Div>{/* ... */}</Div>
   }
);
```

But you also have the ability to do the same with custom components that you've made yourself.

```tsx
import { ComponentBuilders } from './ComponentBuilders';
import { MainAppButton } from './MainAppButton';

export const MyComponent = ComponentBuilders(MainAppButton)(Button => {
   return <Button>{/* ... */}</Button>
})
```

You can also define custom components in an `additionalComponents` object when creating your component builder so that you can access them on the builder using the same dot syntax that you would use for html elements.

```tsx
// in ComponentBuilders.ts

import { MainAppButton } from './MainAppButton';
import { createComponentBuilderGroup } from 'react-extend-components';

export const ComponentBuilders = createComponentBuilderGroup({
   MainAppButton
});

// in MyComponent.tsx

import { ComponentBuilders } from './ComponentBuilders';

export const MyComponent = ComponentBuilders.MainAppButton(
   Button => {
      return <Button />
   }
);
```