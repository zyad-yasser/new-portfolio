import { apiUrl } from './../constants/index';
import Axios from "axios"

export const sendEmailAction = async (data): Promise<any> => {
  try {
    return Axios.post(`${apiUrl}send-email`, data);
  } catch (error) {
    throw(error)
  }
}
