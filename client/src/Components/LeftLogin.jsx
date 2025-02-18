import React from "react";
import img from "../assets/login.png";
import "../style/login.css";
export default function LeftLogin() {
  return (
    <div className="loginLeft">
      <div>
        <img src={img} alt="login" />
      </div>
    </div>
  );
}
