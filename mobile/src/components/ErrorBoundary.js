import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('App ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = async () => {
    try {
      if (Platform.OS !== 'web' && Updates.reloadAsync) {
        await Updates.reloadAsync();
      } else {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }
    } catch (e) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  render() {
    if (this.state.hasError) {
      const isDark = true;
      return (
        <View style={{ flex: 1, backgroundColor: '#090d16', justifyContent: 'center', padding: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderWidth: 2,
              borderColor: '#ef4444',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Ionicons name="shield-alert-outline" size={32} color="#ef4444" />
            </View>
            <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              OgaDriver Safe Mode
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
              An unexpected temporary glitch occurred. Your session and data are secure.
            </Text>
          </View>

          <TouchableOpacity
            onPress={this.handleRestart}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#10b981',
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              marginBottom: 12
            }}
          >
            <Ionicons name="refresh" size={18} color="#090d16" style={{ marginRight: 6 }} />
            <Text style={{ color: '#090d16', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' }}>
              Reload App Sharp Sharp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            activeOpacity={0.8}
            style={{
              borderWidth: 1,
              borderColor: '#1e293b',
              backgroundColor: '#121927',
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>
              Return to Previous Screen
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
