import React from "react";

interface UserProps {
  name: string;
  email: string;
  age: number;
}

const User: React.FC<UserProps> = ({ name, email, age }) => {
  return (
    <div className="user-card">
      <h4>User Name:{name}</h4>
        <p>Email: {email}</p>
        <p>Age: {age}</p>
    </div>
  );
}
export default User;