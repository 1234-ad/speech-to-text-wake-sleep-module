/**
 * React Native Example Component
 * Demonstrates how to use the SpeechToTextModuleRN in a React Native app
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import SpeechToTextModuleRN from '../src/SpeechToTextModuleRN';

const SpeechToTextExample = () => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('stopped');
  const [wakeWord, setWakeWord] = useState('hi');
  const [sleepWord, setSleepWord] = useState('bye');
  const [logs, setLogs] = useState([]);
  
  const speechModuleRef = useRef(null);

  useEffect(() => {
    initializeSpeechModule();
    
    return () => {
      if (speechModuleRef.current) {
        speechModuleRef.current.destroy();
      }
    };
  }, []);

  const initializeSpeechModule = () => {
    try {
      speechModuleRef.current = new SpeechToTextModuleRN({
        wakeWord: wakeWord,
        sleepWord: sleepWord,
        language: 'en-US'
      });

      speechModuleRef.current
        .onWakeWordDetected((word) => {
          addLog(`🟢 Wake word detected: "${word}" - Transcription ACTIVATED`);
        })
        .onSleepWordDetected((word) => {
          addLog(`🔴 Sleep word detected: "${word}" - Transcription DEACTIVATED`);
        })
        .onTranscript((data) => {
          updateTranscript(data);
        })
        .onError((error) => {
          Alert.alert('Error', error);
          addLog(`❌ Error: ${error}`);
        })
        .onStatusChange((newStatus) => {
          setStatus(newStatus);
          setIsListening(newStatus !== 'stopped');
          setIsTranscribing(newStatus === 'transcribing');
          addLog(`📊 Status changed to: ${newStatus}`);
        });

      addLog('✅ Speech module initialized successfully');
    } catch (error) {
      Alert.alert('Initialization Error', error.message);
      addLog(`❌ Initialization failed: ${error.message}`);
    }
  };

  const updateTranscript = (data) => {
    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    const finalIndicator = data.isFinal ? '✓' : '...';
    const newLine = `[${timestamp}] ${data.transcript} ${finalIndicator}`;
    
    setTranscript(prev => {
      const lines = prev.split('\n').filter(line => line.trim());
      if (!data.isFinal && lines.length > 0 && lines[lines.length - 1].includes('...')) {
        lines[lines.length - 1] = newLine;
      } else {
        lines.push(newLine);
      }
      return lines.join('\n');
    });
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleStartListening = async () => {
    if (speechModuleRef.current) {
      speechModuleRef.current.updateConfig({
        wakeWord: wakeWord,
        sleepWord: sleepWord
      });
      
      await speechModuleRef.current.startListening();
      addLog('🎬 Started listening...');
    }
  };

  const handleStopListening = async () => {
    if (speechModuleRef.current) {
      await speechModuleRef.current.stopListening();
      addLog('⏹️ Stopped listening');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setLogs([]);
    addLog('🧹 Cleared transcript and logs');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return '#1976d2';
      case 'transcribing': return '#2e7d32';
      case 'stopped': return '#c62828';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return `🎧 Listening for wake word "${wakeWord}"...`;
      case 'transcribing': return `🎤 Transcribing... (Say "${sleepWord}" to stop)`;
      case 'stopped': return '⏹️ Stopped';
      default: return `Status: ${status}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🎤 Speech-to-Text Wake/Sleep Module</Text>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Configure wake and sleep words{'\n'}
            2. Tap "Start Listening"{'\n'}
            3. Say the wake word to start transcription{'\n'}
            4. Speak normally - your speech will be transcribed{'\n'}
            5. Say the sleep word to stop transcription
          </Text>
        </View>

        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>⚙️ Configuration</Text>
          
          <Text style={styles.label}>Wake Word:</Text>
          <TextInput
            style={styles.input}
            value={wakeWord}
            onChangeText={setWakeWord}
            placeholder="Enter wake word"
          />
          
          <Text style={styles.label}>Sleep Word:</Text>
          <TextInput
            style={styles.input}
            value={sleepWord}
            onChangeText={setSleepWord}
            placeholder="Enter sleep word"
          />
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, isListening && styles.buttonDisabled]}
            onPress={handleStartListening}
            disabled={isListening}
          >
            <Text style={styles.buttonText}>Start Listening</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, !isListening && styles.buttonDisabled]}
            onPress={handleStopListening}
            disabled={!isListening}
          >
            <Text style={styles.buttonText}>Stop Listening</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={clearTranscript}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statusContainer, { borderColor: getStatusColor() }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        <View style={styles.indicatorContainer}>
          <View style={styles.wakeIndicator}>
            <Text style={styles.indicatorText}>Wake: {wakeWord}</Text>
          </View>
          <View style={styles.sleepIndicator}>
            <Text style={styles.indicatorText}>Sleep: {sleepWord}</Text>
          </View>
        </View>

        <View style={styles.transcriptContainer}>
          <Text style={styles.sectionTitle}>📝 Live Transcript:</Text>
          <ScrollView style={styles.transcriptArea}>
            <Text style={styles.transcriptText}>
              {transcript || 'Transcript will appear here...'}
            </Text>
          </ScrollView>
        </View>

        <View style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>📊 Activity Log:</Text>
          <ScrollView style={styles.logsArea}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  instructionsContainer: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  configContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    minWidth: 100,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusContainer: {
    padding: 15,
    borderRadius: 5,
    borderWidth: 2,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  statusText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  wakeIndicator: {
    flex: 1,
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  sleepIndicator: {
    flex: 1,
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  indicatorText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  transcriptContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  transcriptArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    minHeight: 150,
    maxHeight: 200,
  },
  transcriptText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#333',
  },
  logsContainer: {
    marginBottom: 20,
  },
  logsArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    minHeight: 100,
    maxHeight: 150,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default SpeechToTextExample;