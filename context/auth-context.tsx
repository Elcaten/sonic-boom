import * as SecureStore from 'expo-secure-store';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

type ContextType = {
    serverAddress: string;
    username: string;
    password: string;
    setServerAddress: (value: string) => Promise<void>;
    setUsername: (value: string) => Promise<void>;
    setPassword: (value: string) => Promise<void>;
    clearAll: () => Promise<void>;
    isLoading: boolean;
}


// Create the context
const AuthContext = createContext<ContextType | null>(null);

// SecureStore keys
const KEYS = {
    SERVER_ADDRESS: 'server_address',
    USERNAME: 'username',
    PASSWORD: 'password',
};

// Provider component
export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
    const [serverAddress, setServerAddressState] = useState('');
    const [username, setUsernameState] = useState('');
    const [password, setPasswordState] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Load stored values on mount
    useEffect(() => {
        loadStoredValues();
    }, []);

    const loadStoredValues = async () => {
        try {
            const storedServer = await SecureStore.getItemAsync(KEYS.SERVER_ADDRESS);
            const storedUsername = await SecureStore.getItemAsync(KEYS.USERNAME);
            const storedPassword = await SecureStore.getItemAsync(KEYS.PASSWORD);

            if (storedServer) setServerAddressState(storedServer);
            if (storedUsername) setUsernameState(storedUsername);
            if (storedPassword) setPasswordState(storedPassword);
        } catch (error) {
            console.error('Error loading stored values:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setServerAddress = async (value: string) => {
        try {
            setServerAddressState(value);
            if (value) {
                await SecureStore.setItemAsync(KEYS.SERVER_ADDRESS, value);
            } else {
                await SecureStore.deleteItemAsync(KEYS.SERVER_ADDRESS);
            }
        } catch (error) {
            console.error('Error saving server address:', error);
        }
    };

    const setUsername = async (value: string) => {
        try {
            setUsernameState(value);
            if (value) {
                await SecureStore.setItemAsync(KEYS.USERNAME, value);
            } else {
                await SecureStore.deleteItemAsync(KEYS.USERNAME);
            }
        } catch (error) {
            console.error('Error saving username:', error);
        }
    };

    const setPassword = async (value: string) => {
        try {
            setPasswordState(value);
            if (value) {
                await SecureStore.setItemAsync(KEYS.PASSWORD, value);
            } else {
                await SecureStore.deleteItemAsync(KEYS.PASSWORD);
            }
        } catch (error) {
            console.error('Error saving password:', error);
        }
    };

    const clearAll = async () => {
        try {
            await SecureStore.deleteItemAsync(KEYS.SERVER_ADDRESS);
            await SecureStore.deleteItemAsync(KEYS.USERNAME);
            await SecureStore.deleteItemAsync(KEYS.PASSWORD);
            setServerAddressState('');
            setUsernameState('');
            setPasswordState('');
        } catch (error) {
            console.error('Error clearing stored values:', error);
        }
    };

    const value = {
        serverAddress,
        username,
        password,
        setServerAddress,
        setUsername,
        setPassword,
        clearAll,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export the context for advanced use cases
export default AuthContext;