/**
 * Speech-to-Text Module with Wake/Sleep Word Detection
 * Supports real-time transcription with configurable wake and sleep words
 */

class SpeechToTextModule {
  constructor(config = {}) {
    this.config = {
      wakeWord: config.wakeWord || 'hi',
      sleepWord: config.sleepWord || 'bye',
      language: config.language || 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      ...config
    };

    this.isListening = false;
    this.isTranscribing = false;
    this.recognition = null;
    this.callbacks = {
      onWakeWordDetected: null,
      onSleepWordDetected: null,
      onTranscript: null,
      onError: null,
      onStatusChange: null
    };

    this.initializeSpeechRecognition();
  }

  /**
   * Initialize Web Speech API
   */
  initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for speech recognition
   */
  setupEventListeners() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.notifyStatusChange('listening');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.notifyStatusChange('stopped');
      
      // Restart if we should be listening
      if (this.shouldRestart()) {
        setTimeout(() => this.startListening(), 100);
      }
    };

    this.recognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };

    this.recognition.onerror = (event) => {
      this.handleError(event.error);
    };
  }

  /**
   * Handle speech recognition results
   */
  handleSpeechResult(event) {
    const lastResult = event.results[event.results.length - 1];
    const transcript = lastResult[0].transcript.toLowerCase().trim();
    const isFinal = lastResult.isFinal;

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
        transcript: lastResult[0].transcript,
        confidence: lastResult[0].confidence,
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
  startListening() {
    if (!this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        this.handleError(error.message);
      }
    }
  }

  /**
   * Stop listening for speech
   */
  stopListening() {
    if (this.isListening) {
      this.recognition.stop();
    }
    this.isTranscribing = false;
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
    if (this.recognition) {
      this.recognition.lang = this.config.language;
    }
  }

  /**
   * Destroy the module and clean up resources
   */
  destroy() {
    this.stopListening();
    this.callbacks = {};
    this.recognition = null;
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpeechToTextModule;
} else if (typeof window !== 'undefined') {
  window.SpeechToTextModule = SpeechToTextModule;
}