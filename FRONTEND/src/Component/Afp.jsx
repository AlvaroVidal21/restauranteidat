import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
export const Afp = () => {

    const porcentaje = useSelector(state => state.afp.porcentaje);
    const dispatch= useDispatch();
  return (
    <div>
 <p>AFP: {porcentaje}</p>
      <button onClick={() => dispatch({ type: 'habitat' })}>HABITAT</button>
      <button onClick={() => dispatch({ type: 'profuturo' })}>PROFUTURO</button>
   
    </div>
  )
}
