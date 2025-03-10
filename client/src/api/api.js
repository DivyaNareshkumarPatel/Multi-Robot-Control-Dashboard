import axios from "axios";

const url = 'http://localhost:5000' || 'https://multi-robot-control-dashboard.onrender.com';

export const login = async ({ email, password }) => {
    try {
        const response = await axios.post(`${url}/api/users/login`, { email, password });
        return response;
    } catch (error) {
        console.error("Error logging in:", error.response ? error.response.data : error.message);
        return error;
    }
};

export const signup = async ({ name, email, password, role }) => {
    try {
        const response = await fetch(`${url}/api/users/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password, role }),
        });
        return response;
    }
    catch (error) {
        console.error("Error logging in:", error.response ? error.response.data : error.message);
        return error;
    }
}

export const userDetails = async () => {
    try {
        const response = await axios.get(`${url}/api/users/user`);
        return response
    }
    catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error;
    }
}

export const handleUserPermissionLogin = async ({ endpoint, id }) => {
    try {
        const response = await axios.patch(`${url}/api/admin${endpoint}`, { userId: id });
        return response
    }
    catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error
    }
}

export const robotRegistration = async ({ formData }) => {
    try {
        const response = await axios.post(`${url}/api/robot/robots`, formData);
        return response
    }
    catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error
    }
}

export const getAllRobots = async () => {
    try {
        const response = await axios.get(`${url}/api/robot/robots`);
        return response;
    }
    catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error
    }
}

export const sendCommands = async ({ robotId, command }) => {
    try {
        const response = await axios.post(
            `${url}/api/robots/commands`,
            { robotId, command },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "push_server_robot_authentication",
                },
            }
        );
        return response
    }
    catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error
    }
}

export const deleteRobot = async (robotId) => {
    try {
        const response = await axios.delete(`${url}/api/robot/robots/${robotId}`);
        return response
    }
    catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error
    }
}

export const updateRobot = async (robotId, formData) => {
    try {
        const response = await axios.put(`${url}/api/robot/robots/${robotId}`, formData);
        return response
    }
    catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error
    }
}