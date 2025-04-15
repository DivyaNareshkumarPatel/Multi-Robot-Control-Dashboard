import React from 'react'

export default function RobotData({heading, data}) {
  return (
    <div>
      <div style={{background:"rgb(31, 27, 38)", height:"140px", width:"280px", borderRadius:"10px"}}>
        <p style={{paddingTop:"20px", paddingLeft:"20px"}}>{heading}</p>
        <p style={{paddingLeft:"20px", fontSize:"20px", fontWeight:"bold"}}>{data}</p>
      </div>
    </div>
  )
}
