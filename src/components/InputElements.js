import React from 'react';
import labelOf from './stores/LabelStore.js';

import { Input} from 'antd';


export function inputField(fieldId, entity, editable, classes, placeholder='') {
  const label = labelOf(fieldId)

  const value = entity[fieldId];

  const updateStore = (event) => {
    entity[fieldId] = event.target.value;
  }

  return (
    <Input id={fieldId} required disabled={!editable} label={label} value={value} onChange={updateStore} placeholder= {placeholder} className={classes}
    />
  );
}

export function passwordField(fieldId, entity, editable, classes, placeholder='') {
  const label = labelOf(fieldId)

  const value = entity[fieldId];

  const updateStore = (event) => {
    entity[fieldId] = event.target.value;
  }

  return (
    <Input id={fieldId} required disabled={!editable} label={label} type= 'password' value={value} onChange={updateStore} placeholder= {placeholder} className={classes}
    />
  );
}
