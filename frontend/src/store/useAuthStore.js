import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { data } from "react-router-dom";
export const useAuthStore = create ((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile:false,

    isCheckingAuth: true,

    checkAuth: async() =>{
        try {
            const res = await axiosInstance.get("/auth/check");
            set ({authUser: res.data});
        } catch (error) {
            console.log("Error at checkAuth useAuthStore: ", error);
            set({authUser: null});
        } finally{
            set({isCheckingAuth: false});
        }
    },
    
    signup: async(data) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data});
            toast.success("Signup successfully!!");
        } catch (error) {
            toast.error("Signup fail!!");
            console.log("Error at signup useAuthStore: ", error);
        } finally {
            set({isSigningUp: false});
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
    
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },

    logout: async () => {
        try {
            const res = await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("Log out successfully!!");
        } catch (error) {
            toast.error("Log out fail!!");
            console.log("Error at logout useAuthStore: ", error);
        }
    },
    updateProfile: async (data) => {
        set ({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.post("auth/updateProfile", data);
            set ({authUser: res.data});
            toast.success("Update success!!!");
        } catch (error) {
            toast.error("Update fail!!");
            console.log("Error at updateProfile useAuthStore: ", error);
        } finally{
            set({isUpdatingProfile: false});
        }
    }
}));