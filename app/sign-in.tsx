import { ThemedInput } from '@/components/themed-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginForm() {
    const [serverAddress, setServerAddress] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const auth = useAuth()

    const handleSubmit = () => {
        auth.setServerAddress(serverAddress)
        auth.setUsername(username)
        auth.setPassword(password)
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">
                <ThemedView style={styles.formContainer}>
                    <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
                    <ThemedText type='subtitle' style={styles.subtitle}>Sign in to continue</ThemedText>

                    <ThemedView style={styles.inputContainer}>
                        <ThemedText type='defaultSemiBold' style={styles.label}>Server Address</ThemedText>
                        <ThemedInput
                            style={styles.input}
                            placeholder="https://example.com"
                            value={serverAddress}
                            onChangeText={setServerAddress}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                    </ThemedView>

                    <ThemedView style={styles.inputContainer}>
                        <ThemedText type='defaultSemiBold' style={styles.label}>Username</ThemedText>
                        <ThemedInput
                            style={styles.input}
                            placeholder="Enter your username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </ThemedView>

                    <View style={styles.inputContainer}>
                        <ThemedText type='defaultSemiBold' style={styles.label}>Password</ThemedText>
                        <ThemedInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <ThemedText style={styles.buttonText}>Sign In</ThemedText>
                    </TouchableOpacity>


                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: 40,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});