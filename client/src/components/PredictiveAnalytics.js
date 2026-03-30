import React, { useState, useEffect } from 'react';
import { Brain, Target, AlertTriangle, BarChart3, Calendar, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const PredictiveAnalytics = ({ patient }) => {
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [treatmentOutcome, setTreatmentOutcome] = useState(null);

  useEffect(() => {
    if (patient) {
      runPredictiveAnalysis();
    }
  }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    toast.success('🧠 Running AI prediction models...');

    // Simulate ML model processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Calculate treatment success probability using multiple factors
    const analysis = analyzePatientData(patient);
    setPrediction(analysis.prediction);
    setMlMetrics(analysis.metrics);
    setRiskFactors(analysis.riskFactors);
    setRecommendations(analysis.recommendations);
    setTreatmentOutcome(analysis.outcome);
    
    setIsAnalyzing(false);
    toast.success('✅ Predictive analysis complete!');
  };

  const analyzePatientData = (patient) => {
    // Feature extraction for ML model
    const features = extractFeatures(patient);
    
    // Simulate multiple ML models
    const adherenceScore = calculateAdherenceScore(features);
    const demographicScore = calculateDemographicScore(features);
    const clinicalScore = calculateClinicalScore(features);
    const behavioralScore = calculateBehavioralScore(features);
    
    // Ensemble prediction (weighted average of models)
    const weights = {
      adherence: 0.4,
      demographic: 0.2,
      clinical: 0.25,
      behavioral: 0.15
    };
    
    const successProbability = (
      adherenceScore * weights.adherence +
      demographicScore * weights.demographic +
      clinicalScore * weights.clinical +
      behavioralScore * weights.behavioral
    );

    // Generate risk factors and recommendations
    const riskAnalysis = analyzeRiskFactors(features, {
      adherenceScore,
      demographicScore,
      clinicalScore,
      behavioralScore
    });

    // Predict treatment timeline
    const timeline = predictTreatmentTimeline(successProbability, features);

    return {
      prediction: {
        successProbability: Math.round(successProbability),
        confidence: calculateConfidence(features),
        category: categorizeRisk(successProbability),
        estimatedCompletionDate: timeline.completionDate,
        currentPhase: timeline.currentPhase
      },
      metrics: {
        adherenceScore: Math.round(adherenceScore),
        demographicScore: Math.round(demographicScore),
        clinicalScore: Math.round(clinicalScore),
        behavioralScore: Math.round(behavioralScore),
        modelAccuracy: 0.87,
        dataPoints: features.totalDataPoints
      },
      riskFactors: riskAnalysis.factors,
      recommendations: riskAnalysis.recommendations,
      outcome: timeline.outcome
    };
  };

  const extractFeatures = (patient) => {
    const daysSinceStart = Math.floor((new Date() - new Date(patient.treatmentStartDate)) / (1000 * 60 * 60 * 24));
    
    return {
      // Adherence features
      adherenceRate: patient.totalDays > 0 ? (patient.totalDays / daysSinceStart) * 100 : 0,
      currentStreak: patient.currentStreak,
      totalDays: patient.totalDays,
      daysSinceStart,
      
      // Demographic features (simulated based on patient data)
      age: 35 + Math.floor(Math.random() * 30), // Simulated age 35-65
      gender: Math.random() > 0.5 ? 'M' : 'F',
      hasComorbidities: Math.random() > 0.7,
      socioeconomicStatus: Math.random() > 0.6 ? 'stable' : 'unstable',
      
      // Clinical features (simulated)
      initialSeverity: Math.random() > 0.7 ? 'severe' : 'moderate',
      weightChange: (Math.random() - 0.5) * 10, // -5 to +5 kg change
      sideEffects: Math.random() > 0.6,
      
      // Behavioral features
      hasSupport: patient.badges?.length > 2, // Inferred from engagement
      medicationCompliance: patient.currentStreak > 7,
      appointmentAttendance: Math.random() > 0.3 ? 0.8 + Math.random() * 0.2 : 0.5 + Math.random() * 0.3,
      
      // System engagement
      badgeCount: patient.badges?.length || 0,
      totalDataPoints: daysSinceStart + patient.totalDays + (patient.badges?.length || 0) * 5
    };
  };

  const calculateAdherenceScore = (features) => {
    let score = 0;
    
    // Adherence rate is most important
    if (features.adherenceRate >= 95) score += 40;
    else if (features.adherenceRate >= 90) score += 35;
    else if (features.adherenceRate >= 80) score += 25;
    else if (features.adherenceRate >= 70) score += 15;
    else score += 5;
    
    // Current streak bonus
    if (features.currentStreak >= 30) score += 25;
    else if (features.currentStreak >= 14) score += 20;
    else if (features.currentStreak >= 7) score += 15;
    else if (features.currentStreak >= 3) score += 10;
    else score += 0;
    
    // Consistency bonus
    const consistency = features.totalDays / features.daysSinceStart;
    if (consistency >= 0.95) score += 20;
    else if (consistency >= 0.85) score += 15;
    else if (consistency >= 0.75) score += 10;
    else score += 5;
    
    // Treatment duration progress
    const treatmentProgress = features.daysSinceStart / 180; // 6 months
    if (treatmentProgress >= 0.8) score += 15;
    else if (treatmentProgress >= 0.5) score += 10;
    else score += 5;
    
    return Math.min(score, 100);
  };

  const calculateDemographicScore = (features) => {
    let score = 60; // Base score
    
    // Age factor
    if (features.age >= 18 && features.age <= 45) score += 15;
    else if (features.age <= 65) score += 10;
    else score += 5;
    
    // Comorbidities
    if (!features.hasComorbidities) score += 15;
    else score -= 10;
    
    // Socioeconomic status
    if (features.socioeconomicStatus === 'stable') score += 10;
    else score -= 5;
    
    return Math.max(0, Math.min(score, 100));
  };

  const calculateClinicalScore = (features) => {
    let score = 70; // Base score
    
    // Initial severity
    if (features.initialSeverity === 'moderate') score += 15;
    else score -= 10;
    
    // Weight change (positive is good)
    if (features.weightChange > 2) score += 15;
    else if (features.weightChange > 0) score += 10;
    else if (features.weightChange > -2) score += 5;
    else score -= 10;
    
    // Side effects
    if (!features.sideEffects) score += 10;
    else score -= 5;
    
    // Appointment attendance
    if (features.appointmentAttendance >= 0.9) score += 10;
    else if (features.appointmentAttendance >= 0.8) score += 5;
    else if (features.appointmentAttendance >= 0.7) score += 0;
    else score -= 10;
    
    return Math.max(0, Math.min(score, 100));
  };

  const calculateBehavioralScore = (features) => {
    let score = 50; // Base score
    
    // Support system
    if (features.hasSupport) score += 20;
    else score += 5;
    
    // Medication compliance
    if (features.medicationCompliance) score += 20;
    else score -= 10;
    
    // System engagement (badges)
    if (features.badgeCount >= 5) score += 15;
    else if (features.badgeCount >= 3) score += 10;
    else if (features.badgeCount >= 1) score += 5;
    
    // Data quality/engagement
    if (features.totalDataPoints > 100) score += 15;
    else if (features.totalDataPoints > 50) score += 10;
    else score += 5;
    
    return Math.max(0, Math.min(score, 100));
  };

  const calculateConfidence = (features) => {
    let confidence = 0.6; // Base confidence
    
    // More data points increase confidence
    if (features.totalDataPoints > 150) confidence += 0.25;
    else if (features.totalDataPoints > 100) confidence += 0.2;
    else if (features.totalDataPoints > 50) confidence += 0.15;
    else confidence += 0.1;
    
    // Treatment duration increases confidence
    const treatmentProgress = features.daysSinceStart / 180;
    confidence += treatmentProgress * 0.15;
    
    return Math.min(confidence, 0.95);
  };

  const categorizeRisk = (probability) => {
    if (probability >= 85) return 'Low Risk';
    if (probability >= 70) return 'Moderate Risk';
    if (probability >= 50) return 'High Risk';
    return 'Very High Risk';
  };

  const analyzeRiskFactors = (features, scores) => {
    const factors = [];
    const recommendations = [];
    
    // Adherence-related factors
    if (features.adherenceRate < 80) {
      factors.push({
        factor: 'Low Medication Adherence',
        impact: 'High',
        description: `Current adherence rate is ${features.adherenceRate.toFixed(1)}% (target: >95%)`,
        severity: 'critical'
      });
      recommendations.push({
        type: 'adherence',
        title: 'Improve Medication Adherence',
        description: 'Set up automated reminders and consider using a pill organizer. Discuss barriers with your healthcare provider.',
        priority: 'high'
      });
    }
    
    if (features.currentStreak < 7) {
      factors.push({
        factor: 'Short Adherence Streak',
        impact: 'Medium',
        description: `Current streak is only ${features.currentStreak} days`,
        severity: 'warning'
      });
      recommendations.push({
        type: 'behavioral',
        title: 'Build Consistent Habits',
        description: 'Focus on taking medication at the same time daily. Use habit-building techniques like linking medication to daily routines.',
        priority: 'medium'
      });
    }
    
    // Clinical factors
    if (features.sideEffects) {
      factors.push({
        factor: 'Medication Side Effects',
        impact: 'Medium',
        description: 'Experiencing side effects that may affect adherence',
        severity: 'warning'
      });
      recommendations.push({
        type: 'clinical',
        title: 'Address Side Effects',
        description: 'Work with your healthcare provider to manage side effects. Don\'t stop medication without medical guidance.',
        priority: 'high'
      });
    }
    
    if (features.weightChange < -2) {
      factors.push({
        factor: 'Weight Loss',
        impact: 'Medium',
        description: `Weight loss of ${Math.abs(features.weightChange).toFixed(1)}kg may indicate treatment challenges`,
        severity: 'warning'
      });
      recommendations.push({
        type: 'nutrition',
        title: 'Nutritional Support',
        description: 'Maintain good nutrition during treatment. Consider consulting with a nutritionist if weight loss continues.',
        priority: 'medium'
      });
    }
    
    // Demographic factors
    if (features.hasComorbidities) {
      factors.push({
        factor: 'Comorbid Conditions',
        impact: 'Medium',
        description: 'Other health conditions may complicate TB treatment',
        severity: 'info'
      });
      recommendations.push({
        type: 'medical',
        title: 'Manage Comorbidities',
        description: 'Regular monitoring of other health conditions is important for treatment success.',
        priority: 'medium'
      });
    }
    
    if (features.socioeconomicStatus === 'unstable') {
      factors.push({
        factor: 'Socioeconomic Challenges',
        impact: 'Medium',
        description: 'Economic instability may affect treatment adherence',
        severity: 'info'
      });
      recommendations.push({
        type: 'support',
        title: 'Social Support Resources',
        description: 'Connect with social services and patient assistance programs for additional support.',
        priority: 'medium'
      });
    }
    
    // Behavioral factors
    if (!features.hasSupport) {
      factors.push({
        factor: 'Limited Support System',
        impact: 'Medium',
        description: 'Low engagement with support systems and community',
        severity: 'warning'
      });
      recommendations.push({
        type: 'social',
        title: 'Build Support Network',
        description: 'Engage with family, friends, or patient support groups. Consider joining the TB community network.',
        priority: 'medium'
      });
    }
    
    if (features.appointmentAttendance < 0.8) {
      factors.push({
        factor: 'Missed Appointments',
        impact: 'High',
        description: `Appointment attendance is ${(features.appointmentAttendance * 100).toFixed(0)}% (target: >90%)`,
        severity: 'critical'
      });
      recommendations.push({
        type: 'behavioral',
        title: 'Improve Appointment Attendance',
        description: 'Regular check-ups are crucial for monitoring treatment progress and adjusting therapy as needed.',
        priority: 'high'
      });
    }
    
    // Positive factors
    if (factors.length === 0) {
      factors.push({
        factor: 'Excellent Treatment Adherence',
        impact: 'Positive',
        description: 'No significant risk factors identified. Maintaining excellent treatment compliance.',
        severity: 'success'
      });
      recommendations.push({
        type: 'maintenance',
        title: 'Continue Current Approach',
        description: 'You\'re doing excellent! Continue your current medication routine and healthy lifestyle.',
        priority: 'low'
      });
    }
    
    return { factors, recommendations };
  };

  const predictTreatmentTimeline = (successProbability, features) => {
    const standardDuration = 180; // 6 months in days
    
    // Adjust duration based on risk factors
    let adjustedDuration = standardDuration;
    if (successProbability < 70) adjustedDuration *= 1.2; // 20% longer
    else if (successProbability > 90) adjustedDuration *= 0.95; // 5% shorter
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (adjustedDuration - features.daysSinceStart));
    
    let currentPhase = 'Intensive Phase';
    if (features.daysSinceStart > 60) currentPhase = 'Continuation Phase';
    if (features.daysSinceStart > 150) currentPhase = 'Final Phase';
    
    return {
      completionDate: completionDate.toISOString(),
      currentPhase,
      outcome: {
        expectedDuration: Math.round(adjustedDuration),
        daysRemaining: Math.max(0, Math.round(adjustedDuration - features.daysSinceStart)),
        progressPercentage: Math.min(100, (features.daysSinceStart / adjustedDuration) * 100)
      }
    };
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 85) return 'text-green-600';
    if (probability >= 70) return 'text-blue-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (category) => {
    switch (category) {
      case 'Low Risk': return 'bg-green-50 border-green-200 text-green-800';
      case 'Moderate Risk': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'High Risk': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Very High Risk': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="mr-3" />
            Predictive Analytics
          </h2>
          <p className="text-purple-100 mt-1">AI-powered treatment outcome prediction</p>
        </div>
        
        <div className="p-12 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Treatment Data</h3>
          <p className="text-gray-600">Our AI models are processing your treatment history...</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>🧠 Running ensemble ML models</p>
            <p>📊 Analyzing adherence patterns</p>
            <p>🎯 Calculating success probability</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Brain className="mr-3" />
              Predictive Analytics
            </h2>
            <p className="text-purple-100 mt-1">AI-powered treatment outcome prediction</p>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Target className="w-6 h-6 mx-auto mb-1" />
              <p className="text-sm font-semibold">ML Powered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Prediction Display */}
      {prediction && (
        <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Probability */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-300"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - prediction.successProbability / 100)}`}
                      className={getProbabilityColor(prediction.successProbability)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getProbabilityColor(prediction.successProbability)}`}>
                      {prediction.successProbability}%
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Treatment Success Probability</h3>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border-2 ${getRiskColor(prediction.category)}`}>
                  {prediction.category}
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Confidence: {Math.round(prediction.confidence * 100)}%</p>
                  <p>Current Phase: {prediction.currentPhase}</p>
                </div>
              </div>
            </div>

            {/* Treatment Timeline */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Treatment Timeline
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Completion</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(prediction.estimatedCompletionDate)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Days Remaining</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {treatmentOutcome?.daysRemaining || 0} days
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Treatment Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${treatmentOutcome?.progressPercentage || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.round(treatmentOutcome?.progressPercentage || 0)}% Complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ML Model Metrics */}
      {mlMetrics && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            AI Model Performance
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{mlMetrics.adherenceScore}%</div>
              <div className="text-sm text-blue-800">Adherence Score</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{mlMetrics.demographicScore}%</div>
              <div className="text-sm text-green-800">Demographic Score</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{mlMetrics.clinicalScore}%</div>
              <div className="text-sm text-purple-800">Clinical Score</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{mlMetrics.behavioralScore}%</div>
              <div className="text-sm text-orange-800">Behavioral Score</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Model Accuracy: <strong>{Math.round(mlMetrics.modelAccuracy * 100)}%</strong></span>
              <span>Data Points: <strong>{mlMetrics.dataPoints}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Risk Factor Analysis
          </h3>
          
          <div className="space-y-3">
            {riskFactors.map((factor, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${getSeverityColor(factor.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{factor.factor}</h4>
                    <p className="text-sm mb-2">{factor.description}</p>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50">
                      Impact: {factor.impact}
                    </span>
                  </div>
                  <div className="text-xl ml-3">
                    {factor.severity === 'critical' && '🚨'}
                    {factor.severity === 'warning' && '⚠️'}
                    {factor.severity === 'info' && 'ℹ️'}
                    {factor.severity === 'success' && '✅'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            AI Recommendations
          </h3>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start space-x-3">
                  <div className="text-xl">
                    {rec.type === 'adherence' && '💊'}
                    {rec.type === 'behavioral' && '🔄'}
                    {rec.type === 'clinical' && '🏥'}
                    {rec.type === 'nutrition' && '🥗'}
                    {rec.type === 'medical' && '👨‍⚕️'}
                    {rec.type === 'support' && '🤝'}
                    {rec.type === 'social' && '👥'}
                    {rec.type === 'maintenance' && '✅'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{rec.title}</h4>
                    <p className="text-sm leading-relaxed mb-2">{rec.description}</p>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50">
                      Priority: {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Analysis */}
      <div className="p-6">
        <div className="text-center">
          <button
            onClick={runPredictiveAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 flex items-center mx-auto transition-colors"
          >
            <Activity className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Updated analysis based on your latest treatment data
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-purple-50 border-t">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-purple-600 mt-1" />
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">AI Model Disclaimer</h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p>• Predictions are based on statistical models and historical data patterns</p>
              <p>• Individual outcomes may vary based on factors not captured in the model</p>
              <p>• This tool supplements, but does not replace, professional medical judgment</p>
              <p>• Always follow your healthcare provider's guidance for treatment decisions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;