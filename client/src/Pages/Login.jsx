import React from 'react'
import LeftLogin from '../Components/LeftLogin'
import RightLogin from '../Components/RightLogin'
import '../style/login.css'
export default function Login() {
  return (
    <div>
      <div className='login'>
        <LeftLogin/>
        <RightLogin/>
      </div>
    </div>
  )
}