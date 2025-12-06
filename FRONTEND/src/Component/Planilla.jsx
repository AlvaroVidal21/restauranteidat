import React from 'react'
import { Afp } from './Afp';

import Users, { Apiusuarios } from './Users';
import Mesa from './Mesa';


export const Planilla = () => {
  return (
    <div>Planilla

  <Afp></Afp>

    <hr />
    <Mesa/>

    </div>
  )
}
