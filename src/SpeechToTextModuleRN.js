/**
 * Speech-to-Text Module for React Native
 * Uses react-native-voice for cross-platform speech recognition
 */

import Voice from '@react-native-voice/voice';

class SpeechToTextModuleRN {
  constructor(config = {}) {
    this.config = {
      wakeWord: config.wakeWord || 'hi',
      sleepWord: config.sleepWord || 'bye',
      language: config.language || 'en-US',
      ...config
    };

    this.isListening = false;
    this.isTranscribing = false;
    this.callbacks = {
      onWakeWordDetected: null,
      onSleepWordDetected: null,
      onTranscript: null,
      onError: null,
      onStatusChange: null
    };

    this.initializeVoice();
  }

  /**
   * Initialize React Native Voice
   */
  initializeVoice() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  /**
   * Handle speech start
   */
  onSpeechStart() {
    this.isListening = true;
    this.notifyStatusChange('listening');
  }

  /**
   * Handle speech end
   */
  onSpeechEnd() {
    this.isListening = false;
    this.notifyStatusChange('stopped');
    
    // Restart listening after a short delay
    setTimeout(() => {
      if (this.shouldRestart()) {
        this.startListening();
      }
    }, 500);
  }

  /**
   * Handle final speech results
   */
  onSpeechResults(event) {
    if (event.value && event.value.length > 0) {
      const transcript = event.value[0].toLowerCase().trim();
      this.processSpeechResult(transcript, true);
    }
  }

  /**
   * Handle partial speech results
   */
  onSpeechPartialResults(event) {
    if (event.value && event.value.length > 0) {
      const transcript = event.value[0].toLowerCase().trim();
      this.processSpeechResult(transcript, false);
    }
  }

  /**
   * Handle speech errors
   */
  onSpeechError(event) {
    this.handleError(event.error?.message || 'Speech recognition error');
  }

  /**
   * Process speech recognition results
   */
  processSpeechResult(transcript, isFinal) {
    // Check for wake word when not transcribing
    if (!this.isTranscribing && this.containsWakeWord(transcript)) {
      this.activateTranscription();
      return;
    }

    // Check for sleep word when transcribing
    if (this.isTranscribing && this.containsSleepWord(transcript)) {
      this.deactivateTranscription();
      return;
    }

    // Send transcript if we're in transcription mode
    if (this.isTranscribing) {
      this.notifyTranscript({
        transcript: transcript,
        isFinal: isFinal,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check if transcript contains wake word
   */
  containsWakeWord(transcript) {
    return transcript.includes(this.config.wakeWord.toLowerCase());
  }

  /**
   * Check if transcript contains sleep word
   */
  containsSleepWord(transcript) {
    return transcript.includes(this.config.sleepWord.toLowerCase());
  }

  /**
   * Activate transcription mode
   */
  activateTranscription() {
    this.isTranscribing = true;
    this.notifyStatusChange('transcribing');
    if (this.callbacks.onWakeWordDetected) {
      this.callbacks.onWakeWordDetected(this.config.wakeWord);
    }
  }

  /**
   * Deactivate transcription mode
   */
  deactivateTranscription() {
    this.isTranscribing = false;
    this.notifyStatusChange('listening');
    if (this.callbacks.onSleepWordDetected) {
      this.callbacks.onSleepWordDetected(this.config.sleepWord);
    }
  }

  /**
   * Start listening for speech
   */
  async startListening() {
    try {
      if (this.isListening) {
        await this.stopListening();
      }
      
      await Voice.start(this.config.language);
    } catch (error) {
      this.handleError(error.message);
    }
  }

  /**
   * Stop listening for speech
   */
  async stopListening() {
    try {
      await Voice.stop();
      this.isTranscribing = false;
    } catch (error) {
      this.handleError(error.message);
    }
  }

  /**
   * Check if recognition should restart
   */
  shouldRestart() {
    return true; // Always restart to keep listening for wake words
  }

  /**
   * Handle errors
   */
  handleError(error) {
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  /**
   * Notify status change
   */
  notifyStatusChange(status) {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(status);
    }
  }

  /**
   * Notify transcript
   */
  notifyTranscript(data) {
    if (this.callbacks.onTranscript) {
      this.callbacks.onTranscript(data);
    }
  }

  /**
   * Set callback for wake word detection
   */
  onWakeWordDetected(callback) {
    this.callbacks.onWakeWordDetected = callback;
    return this;
  }

  /**
   * Set callback for sleep word detection
   */
  onSleepWordDetected(callback) {
    this.callbacks.onSleepWordDetected = callback;
    return this;
  }

  /**
   * Set callback for transcript updates
   */
  onTranscript(callback) {
    this.callbacks.onTranscript = callback;
    return this;
  }

  /**
   * Set callback for errors
   */
  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }

  /**
   * Set callback for status changes
   */
  onStatusChange(callback) {
    this.callbacks.onStatusChange = callback;
    return this;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isListening: this.isListening,
      isTranscribing: this.isTranscribing,
      wakeWord: this.config.wakeWord,
      sleepWord: this.config.sleepWord
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Destroy the module and clean up resources
   */
  async destroy() {
    try {
      await Voice.destroy();
      this.callbacks = {};
    } catch (error) {
      console.warn('Error destroying voice recognition:', error);
    }
  }
}

export default SpeechToTextModuleRN;