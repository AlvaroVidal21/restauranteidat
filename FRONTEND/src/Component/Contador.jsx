import React from 'react'
import { useDispatch, useSelector } from 'react-redux';

export const Contador = () => {
const count = useSelector(state => state.contador.count);
const dispatch= useDispatch();
  
return (
    <div>

    <p>Contador: {count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>Incrementar</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>Decrementar</button>
    </div>

    
  )
}
