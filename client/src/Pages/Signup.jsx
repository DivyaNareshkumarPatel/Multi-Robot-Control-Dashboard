import React from 'react'
import LeftSignup from '../Components/LeftSignup'
import RightSignup from '../Components/RightSignup'
export default function Signup() {
  return (
    <div>
      <div className='login'>
        <LeftSignup/>
        <RightSignup/>
      </div>
    </div>
  )
}
