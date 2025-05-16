import axios from "axios";

//const url ='https://multi-robot-control-dashboard.onrender.com' || 'http://localhost:5000' ;
const url ='http://localhost:5000' ;

export const login = async ({ email, password }) => {
    try {
        const response = await axios.post(`${url}/api/users/login`, { email, password });
        return response;
    } catch (error) {
        console.error("Error logging in:", error.response ? error.response.data : error.message);
        return error;
    }
};

export const signup = async ({ name, username, email, password, role }) => {
    try {
        const response = await fetch(`${url}/api/users/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, username, email, password, role }),
        });
        return response;
    }
    catch (error) {
        console.error("Error logging in:", error.response ? error.response.data : error.message);
        return error;
    }
}

export const addUser = async (data) => {
    try{
        const response = await axios.post(`${url}/api/users/addUser`, data);
        return response;
    }
    catch(error){
        console.error("Error adding user:", error.response ? error.response.data : error.message);
        return error
    }
}

export const updateUser = async (userId, data) => {
    try{
        const response = await axios.put(`${url}/api/users/updateUser/${userId}`, data);
        return response;
    }
    catch(error){
        console.error("Error updating user:", error.response ? error.response.data : error.message);
        return error
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

export const robotRegistration = async (formData) => {
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

export const addControlTitle = async (robotId, title) => {
    try {
        const response = await axios.post(`${url}/api/robot/robots/addControlTitle`, { robotId, title });
        return response.data;
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error;
    }
};

export const addControls = async (robotId, title, controls) => {
    try {
        const response = await axios.post(`${url}/api/robot/robots/addControls`, { robotId, title, controls });
        return response.data;
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error;
    }
};

export const deleteControlTitle = async (robotId, title) => {
    try {
        const response = await axios.post(`${url}/api/robot/robots/deleteControlTitle`, { robotId, title });
        return response.data;
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error;
    }
};

export const deleteControl = async (robotId, title, control) => {
    try {
        const response = await axios.post(`${url}/api/robot/robots/deleteControl`, { robotId, title, control });
        return response.data;
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error;
    }
};

export const getControlTitlesAndControls = async (robotId) => {
    try {
        const response = await axios.get(`${url}/api/robot/robots/${robotId}/controls`);
        return response.data;  // Return the control titles and controls
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return error;
    }
};

export const assignRobotToUser = async ( userId, robotId ) => {
    try {
        console.log("API Call - Assign Robot:", userId, robotId);
        const response = await axios.post(`${url}/api/userRobot/assignRobot`, { userId, robotId });
        return response;
    } catch (error) {
        console.error("Error assigning robot:", error.response ? error.response.data : error.message);
        return error.response || { status: 500, data: { message: "Server error" } };
    }
};


export const deassignRobotFromUser = async (userId, robotId) => {
    try {
        const response = await axios.post(`${url}/api/userRobot/deassignRobot`, { userId, robotId });
        return response;
    }
    catch (error) {
        console.error("Error deassigning robot:", error.response ? error.response.data : error.message);
        return error;
    }
};

export const getAssignedRobots = async (userId) => {
    try {
        console.log(`Fetching from: ${url}/api/userRobot/getAssignedRobots/${userId}`);
        const response = await axios.get(`${url}/api/userRobot/getAssignedRobots/${userId}`);
        return response;
    }
    catch (error) {
        console.error("Error fetching assigned robots:", error.response ? error.response.data : error.message);
        return error;
    }
};

export const getRobotByEmail = async(email) => {
    try{
        const response = await axios.get(`${url}/api/robot/robots/getRobotsByEmail/${email}`);
        return response;
    }
    catch(error){
        console.error(error.response ? error.response.data : error.message);
        return error
    }
}

export const getCommandHistory = async(robotId, limit = 50) => {
    try {
        const response = await axios.get(`${url}/api/robot/robots/${robotId}/commands?limit=${limit}`);
        console.log(response)
        return response;
    }
    catch (error) {
        console.error("Error fetching command history:", error.response ? error.response.data : error.message);
        return { data: [] };
    }
}

export const getAllChats = async() => {
    try{
        const response = await axios.get(`${url}/api/chat/get-all-chats`);
        return response;
    }
    catch(error){
        return error;
    }
}

export const getAnalytics = async(robotId) =>{
    try{
        const response = await axios.get(`${url}/api/anaytics/getData?robotId=${robotId}`);
        return response
    }
    catch(error){
        return error;
    }
}