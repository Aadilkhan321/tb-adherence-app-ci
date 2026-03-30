import React, { useState, useEffect, useRef } from 'react';
import { Eye, Play, Pause, RotateCcw, Maximize, Info, Award, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const MedicationVisualization = ({ patient }) => {
  const [isVisualizationOpen, setIsVisualizationOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const animationRef = useRef(null);

  // Visualization stages
  const visualizationStages = [
    {
      id: 0,
      title: "Medication Enters Your System",
      description: "TB medication is absorbed into your bloodstream from your stomach",
      color: "#3B82F6", // Blue
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      duration: 3000
    },
    {
      id: 1,
      title: "Traveling Through Blood Vessels",
      description: "The medication travels through your circulatory system to reach infected areas",
      color: "#EF4444", // Red
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      duration: 4000
    },
    {
      id: 2,
      title: "Reaching the Lungs",
      description: "Medication concentrates in lung tissues where TB bacteria typically reside",
      color: "#10B981", // Green
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      duration: 3500
    },
    {
      id: 3,
      title: "Targeting TB Bacteria",
      description: "The medication identifies and attacks Mycobacterium tuberculosis bacteria",
      color: "#F59E0B", // Yellow/Orange
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      duration: 5000
    },
    {
      id: 4,
      title: "Breaking Down Bacterial Walls",
      description: "Medication disrupts the bacterial cell wall, making bacteria unable to survive",
      color: "#8B5CF6", // Purple
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      duration: 4000
    },
    {
      id: 5,
      title: "Healing Process Begins",
      description: "Your immune system clears dead bacteria and healthy tissue begins to regenerate",
      color: "#06B6D4", // Cyan
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      duration: 4500
    },
    {
      id: 6,
      title: "Complete Recovery",
      description: "With consistent treatment, your lungs heal and TB bacteria are eliminated",
      color: "#22C55E", // Bright Green
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      duration: 3000
    }
  ];

  useEffect(() => {
    checkXRSupport();
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const checkXRSupport = () => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then(supported => {
        setIsVRSupported(supported);
      }).catch(() => setIsVRSupported(false));

      navigator.xr.isSessionSupported('immersive-ar').then(supported => {
        setIsARSupported(supported);
      }).catch(() => setIsARSupported(false));
    }
  };

  const startVisualization = () => {
    setIsVisualizationOpen(true);
    setCurrentStage(0);
    setIsPlaying(true);
    playAnimation();
    toast.success('🔬 Starting medication visualization!');
  };

  const playAnimation = () => {
    if (!isPlaying) return;

    const stage = visualizationStages[currentStage];
    
    animationRef.current = setTimeout(() => {
      if (currentStage < visualizationStages.length - 1) {
        setCurrentStage(prev => prev + 1);
        if (isPlaying) {
          playAnimation();
        }
      } else {
        setIsPlaying(false);
        toast.success('🎉 Visualization complete! Your medication is working hard to keep you healthy!');
      }
    }, stage.duration);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const resumeAnimation = () => {
    setIsPlaying(true);
    playAnimation();
  };

  const resetAnimation = () => {
    setCurrentStage(0);
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const handleVRLaunch = () => {
    if (isVRSupported) {
      toast.success('🥽 Launching VR experience... (Demo mode)');
      // In a real implementation, this would launch WebXR VR session
      setTimeout(() => {
        toast('VR session would show 3D medication journey through your body!');
      }, 2000);
    } else {
      toast.error('VR not supported on this device');
    }
  };

  const handleARLaunch = () => {
    if (isARSupported) {
      toast.success('📱 Launching AR experience... (Demo mode)');
      // In a real implementation, this would launch WebXR AR session
      setTimeout(() => {
        toast('AR session would overlay 3D visualization on your camera view!');
      }, 2000);
    } else {
      toast.error('AR not supported on this device');
    }
  };

  const VisualizationParticle = ({ stage, delay = 0 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }, [delay]);

    return (
      <div 
        className={`absolute rounded-full transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        style={{
          backgroundColor: stage.color,
          width: Math.random() * 12 + 8 + 'px',
          height: Math.random() * 12 + 8 + 'px',
          left: Math.random() * 80 + 10 + '%',
          top: Math.random() * 60 + 20 + '%',
          animationDelay: delay + 'ms'
        }}
      />
    );
  };

  const currentStageData = visualizationStages[currentStage];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Eye className="mr-3" />
              Medication Visualization
            </h2>
            <p className="text-indigo-100 mt-1">See how your TB medication works inside your body</p>
          </div>
          <div className="flex space-x-2">
            {isVRSupported && (
              <button
                onClick={handleVRLaunch}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Maximize className="w-4 h-4 mr-2" />
                Launch VR
              </button>
            )}
            {isARSupported && (
              <button
                onClick={handleARLaunch}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Launch AR
              </button>
            )}
          </div>
        </div>
      </div>

      {!isVisualizationOpen ? (
        // Start Screen
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Visualize Your Treatment Journey
            </h3>
            <p className="text-gray-600 mb-6">
              Watch an interactive visualization showing how your TB medication works to eliminate bacteria and heal your body. Understanding your treatment helps with motivation and adherence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🔬</div>
              <h4 className="font-semibold text-gray-800 mb-1">Scientific Accuracy</h4>
              <p className="text-sm text-gray-600">Based on real medical research about TB medication mechanisms</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-800 mb-1">Interactive Learning</h4>
              <p className="text-sm text-gray-600">Pause, play, and explore each stage at your own pace</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">💪</div>
              <h4 className="font-semibold text-gray-800 mb-1">Motivation Boost</h4>
              <p className="text-sm text-gray-600">See the positive impact of consistent medication taking</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Info className="w-5 h-5 text-yellow-600 mr-3" />
                <div className="text-left">
                  <p className="font-semibold text-yellow-800">Educational Purpose</p>
                  <p className="text-sm text-yellow-700">This visualization is for educational purposes and should not replace medical advice from your healthcare provider.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startVisualization}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-colors flex items-center mx-auto"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Visualization
          </button>

          {(isVRSupported || isARSupported) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Enhanced Experience Available:</strong>
              </p>
              <div className="flex justify-center space-x-4">
                {isVRSupported && (
                  <span className="text-sm text-green-600 flex items-center">
                    <Maximize className="w-4 h-4 mr-1" />
                    VR Ready
                  </span>
                )}
                {isARSupported && (
                  <span className="text-sm text-blue-600 flex items-center">
                    <Smartphone className="w-4 h-4 mr-1" />
                    AR Ready
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Visualization Screen
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Stage {currentStage + 1} of {visualizationStages.length}</span>
              <span>{Math.round(((currentStage + 1) / visualizationStages.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStage + 1) / visualizationStages.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className={`relative ${currentStageData.bgColor} ${currentStageData.borderColor} border-2 rounded-lg p-8 mb-6 min-h-[300px] overflow-hidden`}>
            {/* Animated Particles */}
            <div className="absolute inset-0">
              {[...Array(15)].map((_, i) => (
                <VisualizationParticle 
                  key={i} 
                  stage={currentStageData} 
                  delay={i * 200} 
                />
              ))}
            </div>

            {/* Stage Content */}
            <div className="relative z-10 text-center">
              <div className="mb-4">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold"
                  style={{ backgroundColor: currentStageData.color }}
                >
                  {currentStage + 1}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentStageData.title}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                  {currentStageData.description}
                </p>
              </div>

              {/* Stage-specific visual elements */}
              <div className="flex justify-center mt-6">
                {currentStage === 0 && (
                  <div className="text-6xl animate-pulse">💊➡️🩸</div>
                )}
                {currentStage === 1 && (
                  <div className="text-6xl animate-bounce">🫀🔄🩸</div>
                )}
                {currentStage === 2 && (
                  <div className="text-6xl animate-pulse">🫁💨💊</div>
                )}
                {currentStage === 3 && (
                  <div className="text-6xl">🔬⚔️🦠</div>
                )}
                {currentStage === 4 && (
                  <div className="text-6xl animate-ping">💥🦠💊</div>
                )}
                {currentStage === 5 && (
                  <div className="text-6xl animate-pulse">🌟💚🫁</div>
                )}
                {currentStage === 6 && (
                  <div className="text-6xl">🎉✅💪</div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={isPlaying ? pauseAnimation : resumeAnimation}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={resetAnimation}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>

            <button
              onClick={() => setIsVisualizationOpen(false)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Exit Visualization
            </button>
          </div>

          {/* Achievement Notification */}
          {currentStage === visualizationStages.length - 1 && !isPlaying && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Award className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-green-800">Visualization Complete! 🎉</h4>
                  <p className="text-green-700">You've learned how your TB medication works. Keep taking it consistently for the best results!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationVisualization;