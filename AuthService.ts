import { User } from '../types';

// This is a simulation of a Google Auth Provider
// In a real app, this would use Firebase Auth or Google Identity Services SDK

export const AuthService = {
  login: async (): Promise<User> => {
    return new Promise((resolve) => {
      // Simulate network delay and popup interaction
      setTimeout(() => {
        resolve({
          id: 'google-user-123',
          name: 'Alex Doe',
          email: 'alex.doe@gmail.com',
          avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIq8d_8d-7_c_l-2_7-5_l-4_0-3_c=s96-c' // Generic avatar placeholder
        });
      }, 1500);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
};