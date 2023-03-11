# react-extend-components
This package makes it easy to create components that are based on already existing components, while handling prop and ref merging automatically.

Here's an example of basic usage. 

```tsx
// in ComponentBuilders.ts

import { createComponentBuilderGroup } from 'react-extend-components';

export const ComponentBuilders = createComponentBuilderGroup();

// in Form.tsx

import { ComponentBuilders } from './ComponentBuilders';

export const SubmitButton = ComponentBuilders.button(Button => {
   return <Button 
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
   return <>
      {/* ... */}
      <SubmitButton 
         style={{color: 'gray'}} // style is overridden automatically
      /> 
      {/* ... */}
   </>
}

```

## Reasoning

Sometimes when we create components that are based on other components (like HTML elements), we'd like to give the user of the component the ability to customize the props of the root element. Here is how this is often accomplished.

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

This seems easy enough. But what if the user wanted to add an `onClick` listener and an `onMouseUp` listener to the component and we've already used those within the component? We'd have to merge those two functions as well.

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

If the users of this component also needed to access the ref of the underlying button element and we were already using a ref within the component, our example gets even more complicated.

```tsx
import { forwardRef } from 'react';

const SubmitButton = forwardRef<
   HTMLDivElement, 
   HTMLAttributes<HTMLDivElement>
>(
   function SubmitButton(
      {
         className, 
         style, 
         onClick, 
         onMouseUp, 
         ...props
      }, 
      theirRef
   ){

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

It's easy to see how a such a simple component could easily become much more complicated when having to support this sort of functionality.. 