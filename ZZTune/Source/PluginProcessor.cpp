#include "PluginProcessor.h"

namespace {
float p(juce::AudioProcessorValueTreeState& s, const char* id) {
    return s.getRawParameterValue(id)->load();
}
int pi(juce::AudioProcessorValueTreeState& s, const char* id) {
    return (int) std::lround(p(s,id));
}
float dbGain(float db) { return std::pow(10.0f, db / 20.0f); }
float clampf(float x, float a, float b) { return std::max(a, std::min(b, x)); }
constexpr float kPi = 3.14159265358979323846f;
}

ZZTuneAudioProcessor::ZZTuneAudioProcessor()
: AudioProcessor(BusesProperties()
    .withInput("Input", juce::AudioChannelSet::stereo(), true)
    .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
  apvts(*this, nullptr, "ZZTUNE", createLayout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout ZZTuneAudioProcessor::createLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout l;
    auto pct = juce::NormalisableRange<float>(0.0f,100.0f,1.0f);
    l.add(std::make_unique<juce::AudioParameterChoice>(juce::ParameterID{"mode",1},"Mode",juce::StringArray{"Auto","Live","Finish"},0));
    l.add(std::make_unique<juce::AudioParameterChoice>(juce::ParameterID{"style",1},"Style",juce::StringArray{"Clean Rap","Smooth Melody","Hard Tune"},0));
    l.add(std::make_unique<juce::AudioParameterChoice>(juce::ParameterID{"key",1},"Key",juce::StringArray{"C","C#","D","D#","E","F","F#","G","G#","A","A#","B"},0));
    l.add(std::make_unique<juce::AudioParameterChoice>(juce::ParameterID{"scale",1},"Scale",juce::StringArray{"Major","Minor","Chromatic"},0));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"tune",1},"Tune Strength",pct,72.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"speed",1},"Tune Speed",pct,75.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"human",1},"Humanize",pct,18.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"cleanup",1},"Cleanup EQ",pct,55.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"comp",1},"Compression",pct,55.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"deess",1},"De-Esser",pct,45.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"air",1},"Air / Presence",pct,45.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"warm",1},"Warmth",pct,18.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"space",1},"Space",pct,12.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"delay",1},"Delay",pct,8.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"mix",1},"Tune Mix",pct,100.0f));
    l.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"output",1},"Output",juce::NormalisableRange<float>(-12.0f,6.0f,0.1f),0.0f));
    return l;
}

void ZZTuneAudioProcessor::prepareToPlay(double sampleRate, int)
{
    fs = sampleRate;
    const size_t trackN = 2048;
    const size_t delayN = (size_t) std::ceil(fs * 0.06) + 16;
    const size_t echoN = (size_t) std::ceil(fs * 0.45) + 16;
    for (int c=0;c<2;++c) {
        pitchBuf[c].assign(trackN,0.0f);
        delayBuf[c].assign(delayN,0.0f);
        echoBuf[c].assign(echoN,0.0f);
    }
    resetDSP();
    setLatencySamples((int) std::round(fs * 0.016));
}

void ZZTuneAudioProcessor::resetDSP()
{
    pitchWrite=delayWrite=echoWrite=0; analyseCounter=0; detectedHz=confidence=0;
    for(int c=0;c<2;++c){
        smoothRatio[c]=1.0f; shiftPhase[c]=c?0.5f:0.0f;
        hpX1[c]=hpY1[c]=compEnv[c]=essLP[c]=essEnv[c]=rvState[c]=0.0f;
        std::fill(pitchBuf[c].begin(),pitchBuf[c].end(),0.0f);
        std::fill(delayBuf[c].begin(),delayBuf[c].end(),0.0f);
        std::fill(echoBuf[c].begin(),echoBuf[c].end(),0.0f);
    }
}

bool ZZTuneAudioProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    auto in=layouts.getMainInputChannelSet(), out=layouts.getMainOutputChannelSet();
    return in==out && (in==juce::AudioChannelSet::mono() || in==juce::AudioChannelSet::stereo());
}

bool ZZTuneAudioProcessor::finishMode() const
{
    const int mode = pi(const_cast<juce::AudioProcessorValueTreeState&>(apvts),"mode");
    if(mode==1) return false;
    if(mode==2) return true;
    if(isNonRealtime()) return true;
    if(auto* ph=getPlayHead())
        if(auto pos=ph->getPosition())
            return !pos->getIsRecording();
    return false;
}

void ZZTuneAudioProcessor::analysePitch()
{
    const auto& b=pitchBuf[0];
    if(b.empty()) return;
    const int N=1024;
    std::array<float,N> x{};
    double mean=0.0;
    for(int i=0;i<N;++i){
        size_t idx=(pitchWrite+b.size()-N+(size_t)i)%b.size();
        x[(size_t)i]=b[idx]; mean+=x[(size_t)i];
    }
    mean/=N;
    double energy=0.0;
    for(auto& v:x){v-=(float)mean; energy+=(double)v*v;}
    if(std::sqrt(energy/N)<0.0025){confidence=0; return;}

    int minLag=std::max(2,(int)(fs/650.0));
    int maxLag=std::min(N/2,(int)(fs/65.0));
    float best=-1.0f; int bestLag=0;
    for(int lag=minLag;lag<=maxLag;++lag){
        double xy=0,xx=0,yy=0;
        int n=N-lag;
        for(int i=0;i<n;++i){
            float a=x[(size_t)i], bb=x[(size_t)(i+lag)];
            xy+=(double)a*bb; xx+=(double)a*a; yy+=(double)bb*bb;
        }
        float c=(float)(xy/(std::sqrt(xx*yy)+1e-12));
        if(c>best){best=c; bestLag=lag;}
    }
    if(bestLag>0 && best>0.42f){detectedHz=(float)(fs/bestLag); confidence=best;}
    else confidence=std::max(0.0f,best);
}

float ZZTuneAudioProcessor::nearestTarget(float hz) const
{
    if(hz<=0) return hz;
    int key=pi(const_cast<juce::AudioProcessorValueTreeState&>(apvts),"key");
    int scale=pi(const_cast<juce::AudioProcessorValueTreeState&>(apvts),"scale");
    static constexpr int major[7]={0,2,4,5,7,9,11};
    static constexpr int minor[7]={0,2,3,5,7,8,10};
    float midi=69.0f+12.0f*std::log2(hz/440.0f);
    int center=(int)std::lround(midi), bestNote=center;
    float best=999.0f;
    for(int n=center-12;n<=center+12;++n){
        int pc=(n%12+12)%12; bool ok=(scale==2);
        if(!ok){
            int rel=(pc-key+120)%12;
            const int* sc=scale==1?minor:major;
            for(int i=0;i<7;++i) if(rel==sc[i]) ok=true;
        }
        if(ok){
            float d=std::abs(midi-(float)n);
            if(d<best){best=d; bestNote=n;}
        }
    }
    return 440.0f*std::pow(2.0f,((float)bestNote-69.0f)/12.0f);
}

float ZZTuneAudioProcessor::readDelay(const std::vector<float>& d, float pos) const
{
    float n=(float)d.size();
    while(pos<0) pos+=n; while(pos>=n) pos-=n;
    int i0=(int)std::floor(pos), i1=(i0+1)%(int)d.size();
    float f=pos-i0;
    return d[(size_t)i0]*(1.0f-f)+d[(size_t)i1]*f;
}

float ZZTuneAudioProcessor::pitchShift(float in, float ratio, int c)
{
    auto& d=delayBuf[c];
    d[delayWrite]=in;
    float speed=p(const_cast<juce::AudioProcessorValueTreeState&>(apvts),"speed")*0.01f;
    float a=1.0f-std::exp(-1.0f/(float)(fs*(0.140-0.132*speed)));
    smoothRatio[c]+=a*(clampf(ratio,0.72f,1.38f)-smoothRatio[c]);
    if(std::abs(smoothRatio[c]-1.0f)<0.00035f) return in;

    float minD=(float)(fs*0.0035), maxD=(float)(fs*0.016), range=maxD-minD;
    shiftPhase[c]+=std::abs(1.0f-smoothRatio[c])/range;
    shiftPhase[c]-=std::floor(shiftPhase[c]);
    float p1=shiftPhase[c], p2=p1+0.5f; p2-=std::floor(p2);
    auto dd=[&](float ph){return smoothRatio[c]>=1.0f?maxD-ph*range:minD+ph*range;};
    float w1=0.5f-0.5f*std::cos(2.0f*kPi*p1), w2=0.5f-0.5f*std::cos(2.0f*kPi*p2);
    float y1=readDelay(d,(float)delayWrite-dd(p1));
    float y2=readDelay(d,(float)delayWrite-dd(p2));
    return y1*w1+y2*w2;
}

float ZZTuneAudioProcessor::strip(float x, int c, bool finish)
{
    float cleanup=p(apvts,"cleanup")*0.01f, comp=p(apvts,"comp")*0.01f;
    float de=p(apvts,"deess")*0.01f, air=p(apvts,"air")*0.01f, warm=p(apvts,"warm")*0.01f;
    float fc=70.0f+55.0f*cleanup;
    float alpha=std::exp(-2.0f*kPi*fc/(float)fs);
    float hp=alpha*(hpY1[c]+x-hpX1[c]); hpX1[c]=x; hpY1[c]=hp; x=hp;

    float essA=1.0f-std::exp(-2.0f*kPi*4200.0f/(float)fs);
    essLP[c]+=essA*(x-essLP[c]);
    float hf=x-essLP[c];
    essEnv[c]=0.97f*essEnv[c]+0.03f*std::abs(hf);
    float th=0.020f-0.011f*de;
    if(essEnv[c]>th) x*=dbGain(-std::min(6.0f*de,20.0f*std::log10(essEnv[c]/th)));

    float ax=std::abs(x), atk=0.35f, rel=0.995f;
    compEnv[c]=(ax>compEnv[c]?atk:rel)*compEnv[c]+(1.0f-(ax>compEnv[c]?atk:rel))*ax;
    float threshold=-12.0f-10.0f*comp-(finish?2.0f:0.0f), ratioC=1.5f+3.5f*comp;
    float envDb=20.0f*std::log10(std::max(compEnv[c],1e-8f));
    if(envDb>threshold) x*=dbGain((threshold+(envDb-threshold)/ratioC)-envDb);

    float bright=1.0f+0.22f*air;
    x*=bright;
    float drive=1.0f+1.7f*warm;
    x=std::tanh(x*drive)/std::tanh(drive);
    return x;
}

void ZZTuneAudioProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    int chs=buffer.getNumChannels(), n=buffer.getNumSamples();
    bool finish=finishMode();
    int style=pi(apvts,"style");
    float tune=p(apvts,"tune")*0.01f, human=p(apvts,"human")*0.01f, mix=p(apvts,"mix")*0.01f;
    float styleBase=style==2?0.85f:(style==1?0.45f:0.55f);
    float strength=clampf(styleBase+0.42f*tune+(finish?0.08f:0.0f),0.0f,1.0f);

    for(int i=0;i<n;++i){
        float mono=buffer.getSample(0,i);
        if(chs>1) mono=0.5f*(mono+buffer.getSample(1,i));
        pitchBuf[0][pitchWrite]=mono;
        pitchWrite=(pitchWrite+1)%pitchBuf[0].size();
        if(++analyseCounter>=96){analyseCounter=0; analysePitch();}

        float r=1.0f;
        if(detectedHz>0 && confidence>0.45f){
            float tgt=nearestTarget(detectedHz);
            float raw=clampf(tgt/detectedHz,0.72f,1.38f);
            float cents=std::abs(1200.0f*std::log2(std::max(raw,0.001f)));
            float preserve=human*(1.0f-clampf(cents/45.0f,0.0f,1.0f))*(finish?0.4f:0.7f);
            r=std::pow(raw,strength*(1.0f-preserve));
        }

        for(int c=0;c<chs;++c){
            float dry=buffer.getSample(c,i);
            float wet=pitchShift(dry,r,std::min(c,1));
            float y=dry*(1.0f-mix)+wet*mix;
            y=strip(y,std::min(c,1),finish);

            float delayAmt=p(apvts,"delay")*0.01f;
            auto& ed=echoBuf[std::min(c,1)];
            size_t rd=(echoWrite+ed.size()-(size_t)std::round(fs*0.155))%ed.size();
            float e=ed[rd];
            ed[echoWrite]=y+e*(0.12f+0.18f*delayAmt);
            y+=e*delayAmt*(finish?0.24f:0.15f);

            float space=p(apvts,"space")*0.01f;
            rvState[std::min(c,1)]=0.94f*rvState[std::min(c,1)]+0.06f*y;
            y+=rvState[std::min(c,1)]*space*(finish?0.12f:0.07f);

            y*=dbGain(p(apvts,"output"));
            buffer.setSample(c,i,clampf(y,-1.2f,1.2f));
        }
        delayWrite=(delayWrite+1)%delayBuf[0].size();
        echoWrite=(echoWrite+1)%echoBuf[0].size();
    }
}

juce::AudioProcessorEditor* ZZTuneAudioProcessor::createEditor()
{
    return new juce::GenericAudioProcessorEditor(*this);
}

void ZZTuneAudioProcessor::getStateInformation(juce::MemoryBlock& dest)
{
    auto state=apvts.copyState();
    std::unique_ptr<juce::XmlElement> xml(state.createXml());
    copyXmlToBinary(*xml,dest);
}

void ZZTuneAudioProcessor::setStateInformation(const void* data, int bytes)
{
    std::unique_ptr<juce::XmlElement> xml(getXmlFromBinary(data,bytes));
    if(xml && xml->hasTagName(apvts.state.getType()))
        apvts.replaceState(juce::ValueTree::fromXml(*xml));
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new ZZTuneAudioProcessor();
}
