# react-extend-components
A package that makes it easy to create components that are based on already existing components.

Here's an example of basic usage. 

```
// in ComponentBuilders.ts

import { createComponentBuilderGroup } from 'react-extend-components';

export const ComponentBuilders = createComponentBuilderGroup();

// in SubmitButton.tsx

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

// in Form.tsx

import {SubmitButton} from './SubmitButton';

export function Form(){
   return <>
      {/* ... */}
      <SubmitButton 
         style={{color: 'gray}} // style is overridden automatically
      /> 
      {/* ... */}
   </>
}

```
