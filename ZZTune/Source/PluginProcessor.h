#pragma once
#include <JuceHeader.h>
#include <array>
#include <vector>
#include <cmath>
#include <algorithm>

class ZZTuneAudioProcessor final : public juce::AudioProcessor
{
public:
    ZZTuneAudioProcessor();
    ~ZZTuneAudioProcessor() override = default;

    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }
    const juce::String getName() const override { return JucePlugin_Name; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 2.0; }
    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}
    void getStateInformation(juce::MemoryBlock&) override;
    void setStateInformation(const void*, int) override;

    juce::AudioProcessorValueTreeState apvts;

private:
    static juce::AudioProcessorValueTreeState::ParameterLayout createLayout();
    bool finishMode() const;
    void resetDSP();
    void analysePitch();
    float nearestTarget(float hz) const;
    float pitchShift(float input, float ratio, int channel);
    float strip(float x, int channel, bool finish);
    float readDelay(const std::vector<float>& d, float pos) const;

    double fs = 48000.0;
    std::vector<float> pitchBuf[2];
    std::vector<float> delayBuf[2];
    size_t pitchWrite = 0, delayWrite = 0;
    int analyseCounter = 0;
    float detectedHz = 0.0f, confidence = 0.0f;
    float smoothRatio[2] {1.0f,1.0f};
    float shiftPhase[2] {0.0f,0.5f};
    float hpX1[2] {}, hpY1[2] {};
    float compEnv[2] {}, essLP[2] {}, essEnv[2] {};
    float rvState[2] {};
    std::vector<float> echoBuf[2];
    size_t echoWrite = 0;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(ZZTuneAudioProcessor)
};
