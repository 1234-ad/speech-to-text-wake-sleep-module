# 🎤 Speech-to-Text Wake/Sleep Module

A modular, reusable speech-to-text transcription system that activates with wake words and deactivates with sleep words. Designed for mobile app integration with React Native support.

## 🚀 Features

- **Wake/Sleep Word Detection**: Automatically start/stop transcription with configurable trigger words
- **Real-time Transcription**: Live speech-to-text conversion with interim and final results
- **Cross-platform Support**: Works in web browsers and React Native apps
- **Modular Design**: Easy to integrate into existing applications
- **Configurable**: Customizable wake words, sleep words, and language settings
- **Event-driven Architecture**: Callback-based system for handling events
- **Continuous Listening**: Automatically restarts listening after sleep word detection

## 📋 Requirements

### Web Browser Version
- Modern web browser with Web Speech API support (Chrome, Edge, Safari)
- HTTPS connection (required for microphone access)

### React Native Version
- React Native 0.60+
- `@react-native-voice/voice` package
- iOS 10+ / Android API 21+

## 🛠️ Installation

### For Web Applications
```bash
# Clone the repository
git clone https://github.com/1234-ad/speech-to-text-wake-sleep-module.git
cd speech-to-text-wake-sleep-module

# Include the module in your project
<script src="src/SpeechToTextModule.js"></script>
```

### For React Native Applications
```bash
# Install the required dependency
npm install @react-native-voice/voice

# Copy the React Native module to your project
cp src/SpeechToTextModuleRN.js your-project/src/
```

## 🎯 Quick Start

### Web Browser Example
```javascript
// Initialize the module
const speechModule = new SpeechToTextModule({
  wakeWord: 'hi',
  sleepWord: 'bye',
  language: 'en-US'
});

// Set up event handlers
speechModule
  .onWakeWordDetected((word) => {
    console.log(`Wake word "${word}" detected - Starting transcription`);
  })
  .onSleepWordDetected((word) => {
    console.log(`Sleep word "${word}" detected - Stopping transcription`);
  })
  .onTranscript((data) => {
    console.log('Transcript:', data.transcript);
    console.log('Is Final:', data.isFinal);
  })
  .onError((error) => {
    console.error('Error:', error);
  });

// Start listening
speechModule.startListening();
```

### React Native Example
```javascript
import SpeechToTextModuleRN from './src/SpeechToTextModuleRN';

const MyComponent = () => {
  const [speechModule] = useState(() => new SpeechToTextModuleRN({
    wakeWord: 'hello',
    sleepWord: 'goodbye'
  }));

  useEffect(() => {
    speechModule
      .onWakeWordDetected((word) => {
        console.log(`Wake word detected: ${word}`);
      })
      .onTranscript((data) => {
        setTranscript(data.transcript);
      });

    return () => speechModule.destroy();
  }, []);

  const startListening = () => {
    speechModule.startListening();
  };

  // ... rest of component
};
```

## 📖 API Reference

### Constructor Options
```javascript
const options = {
  wakeWord: 'hi',           // Word to start transcription
  sleepWord: 'bye',         // Word to stop transcription
  language: 'en-US',        // Speech recognition language
  continuous: true,         // Keep listening continuously
  interimResults: true,     // Return partial results
  maxAlternatives: 1        // Number of alternative results
};
```

### Methods

#### `startListening()`
Starts the speech recognition and begins listening for the wake word.

#### `stopListening()`
Stops speech recognition and transcription.

#### `updateConfig(newConfig)`
Updates the module configuration without reinitializing.

#### `getStatus()`
Returns the current status of the module.

#### `destroy()`
Cleans up resources and stops all recognition.

### Event Handlers

#### `onWakeWordDetected(callback)`
Called when the wake word is detected.
```javascript
speechModule.onWakeWordDetected((word) => {
  console.log(`Wake word "${word}" detected`);
});
```

#### `onSleepWordDetected(callback)`
Called when the sleep word is detected.
```javascript
speechModule.onSleepWordDetected((word) => {
  console.log(`Sleep word "${word}" detected`);
});
```

#### `onTranscript(callback)`
Called when speech is transcribed (only during active transcription).
```javascript
speechModule.onTranscript((data) => {
  console.log('Transcript:', data.transcript);
  console.log('Confidence:', data.confidence);
  console.log('Is Final:', data.isFinal);
  console.log('Timestamp:', data.timestamp);
});
```

#### `onStatusChange(callback)`
Called when the module status changes.
```javascript
speechModule.onStatusChange((status) => {
  // status can be: 'listening', 'transcribing', 'stopped'
  console.log('Status:', status);
});
```

#### `onError(callback)`
Called when an error occurs.
```javascript
speechModule.onError((error) => {
  console.error('Speech recognition error:', error);
});
```

## 🎮 Demo

### Web Demo
1. Open `demo/index.html` in a web browser
2. Allow microphone permissions
3. Click "Start Listening"
4. Say "Hi" to start transcription
5. Speak normally to see live transcription
6. Say "Bye" to stop transcription

### React Native Demo
Check the `examples/ReactNativeExample.js` file for a complete React Native implementation.

## 🔧 Configuration Examples

### Different Languages
```javascript
const spanishModule = new SpeechToTextModule({
  wakeWord: 'hola',
  sleepWord: 'adiós',
  language: 'es-ES'
});
```

### Custom Wake/Sleep Words
```javascript
const customModule = new SpeechToTextModule({
  wakeWord: 'start recording',
  sleepWord: 'stop recording',
  language: 'en-US'
});
```

## 🏗️ Architecture

The module follows a state-based architecture:

1. **Listening State**: Continuously listens for the wake word
2. **Transcribing State**: Actively transcribes speech and listens for sleep word
3. **Stopped State**: No active listening or transcription

```
[Stopped] → startListening() → [Listening] → wakeWord → [Transcribing] → sleepWord → [Listening]
```

## 🔒 Privacy & Security

- All speech processing happens locally on the device
- No audio data is sent to external servers (when using Web Speech API)
- Microphone access requires user permission
- Module can be destroyed to stop all listening activities

## 🐛 Troubleshooting

### Common Issues

**"Speech recognition not supported"**
- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Check that you're on HTTPS (required for microphone access)

**Wake word not detected**
- Speak clearly and at normal volume
- Ensure the wake word is pronounced as configured
- Check microphone permissions

**Transcription not working**
- Verify the wake word was detected (check status)
- Ensure you're in transcription mode
- Check for error callbacks

### Browser Compatibility
- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ Firefox (limited support)

## 📱 React Native Setup

### iOS Setup
1. Add microphone permission to `Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for speech recognition</string>
```

### Android Setup
1. Add permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Web Speech API for browser-based speech recognition
- @react-native-voice/voice for React Native speech recognition
- Internship challenge by Mukunda for the inspiration

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the demo implementations

---

**Built for the internship coding challenge - Real-time speech-to-text with wake/sleep word functionality** 🚀