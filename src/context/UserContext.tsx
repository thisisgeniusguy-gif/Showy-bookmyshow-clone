import {createContext} from "react";

const UserContext = createContext({ name: '', email: '', age: 0 ,bookedEvents: []});

export default UserContext;