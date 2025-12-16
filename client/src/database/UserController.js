import axios from 'axios';

export const fetchUser = async (userId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/user/${userId}`);
    //console.log("fetchUser = " + JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}
