import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Shield, Plus, X, CheckCircle, Info, Pill, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const DrugInteractionChecker = ({ patient }) => {
  const [userMedications, setUserMedications] = useState([]);
  const [newMedication, setNewMedication] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // TB medications that the patient is taking
  const tbMedications = [
    { name: 'Isoniazid', dosage: '300mg', frequency: 'Daily' },
    { name: 'Rifampin', dosage: '600mg', frequency: 'Daily' },
    { name: 'Ethambutol', dosage: '800mg', frequency: 'Daily' },
    { name: 'Pyrazinamide', dosage: '1500mg', frequency: 'Daily' }
  ];

  // Mock drug database with interaction data
  const drugDatabase = {
    // Common medications
    'acetaminophen': { category: 'Pain Relief', riskLevel: 'safe', commonNames: ['Tylenol', 'Paracetamol'] },
    'ibuprofen': { category: 'NSAID', riskLevel: 'caution', commonNames: ['Advil', 'Motrin'] },
    'aspirin': { category: 'NSAID', riskLevel: 'caution', commonNames: ['Bayer', 'Aspro'] },
    'warfarin': { category: 'Anticoagulant', riskLevel: 'major', commonNames: ['Coumadin', 'Jantoven'] },
    'digoxin': { category: 'Cardiac', riskLevel: 'major', commonNames: ['Lanoxin'] },
    'phenytoin': { category: 'Anticonvulsant', riskLevel: 'major', commonNames: ['Dilantin'] },
    'carbamazepine': { category: 'Anticonvulsant', riskLevel: 'major', commonNames: ['Tegretol'] },
    'metformin': { category: 'Diabetes', riskLevel: 'monitor', commonNames: ['Glucophage'] },
    'insulin': { category: 'Diabetes', riskLevel: 'monitor', commonNames: ['Humalog', 'Lantus'] },
    'omeprazole': { category: 'PPI', riskLevel: 'minor', commonNames: ['Prilosec'] },
    'simvastatin': { category: 'Statin', riskLevel: 'caution', commonNames: ['Zocor'] },
    'amlodipine': { category: 'Calcium Channel Blocker', riskLevel: 'safe', commonNames: ['Norvasc'] },
    'lisinopril': { category: 'ACE Inhibitor', riskLevel: 'safe', commonNames: ['Prinivil', 'Zestril'] },
    'metoprolol': { category: 'Beta Blocker', riskLevel: 'safe', commonNames: ['Lopressor', 'Toprol'] },
    'hydrochlorothiazide': { category: 'Diuretic', riskLevel: 'safe', commonNames: ['Microzide'] },
    'lorazepam': { category: 'Benzodiazepine', riskLevel: 'caution', commonNames: ['Ativan'] },
    'sertraline': { category: 'SSRI', riskLevel: 'monitor', commonNames: ['Zoloft'] },
    'fluoxetine': { category: 'SSRI', riskLevel: 'monitor', commonNames: ['Prozac'] },
    'levothyroxine': { category: 'Thyroid', riskLevel: 'minor', commonNames: ['Synthroid'] },
    'prednisone': { category: 'Corticosteroid', riskLevel: 'monitor', commonNames: ['Deltasone'] },
    'albuterol': { category: 'Bronchodilator', riskLevel: 'safe', commonNames: ['ProAir', 'Ventolin'] },
    // Supplements
    'vitamin_d': { category: 'Vitamin', riskLevel: 'safe', commonNames: ['Vitamin D3'] },
    'calcium': { category: 'Mineral', riskLevel: 'minor', commonNames: ['Calcium Carbonate'] },
    'iron': { category: 'Mineral', riskLevel: 'minor', commonNames: ['Ferrous Sulfate'] },
    'multivitamin': { category: 'Vitamin', riskLevel: 'safe', commonNames: ['Daily Multivitamin'] },
    'fish_oil': { category: 'Supplement', riskLevel: 'safe', commonNames: ['Omega-3'] },
    'probiotics': { category: 'Supplement', riskLevel: 'safe', commonNames: ['Lactobacillus'] }
  };

  // Interaction rules with TB medications
  const interactionRules = {
    'warfarin': {
      tbMeds: ['Rifampin'],
      severity: 'Major',
      description: 'Rifampin significantly reduces warfarin effectiveness by increasing metabolism. Warfarin dose may need to be increased by 2-5 times.',
      recommendation: 'Monitor INR closely and adjust warfarin dose as needed. Consider alternative anticoagulant.',
      mechanism: 'CYP450 enzyme induction'
    },
    'digoxin': {
      tbMeds: ['Rifampin'],
      severity: 'Major',
      description: 'Rifampin reduces digoxin levels by 50-70%, potentially leading to treatment failure.',
      recommendation: 'Monitor digoxin levels closely and increase dose as needed.',
      mechanism: 'P-glycoprotein induction'
    },
    'phenytoin': {
      tbMeds: ['Isoniazid'],
      severity: 'Major',
      description: 'Isoniazid inhibits phenytoin metabolism, increasing risk of phenytoin toxicity.',
      recommendation: 'Monitor phenytoin levels closely. Phenytoin dose reduction may be needed.',
      mechanism: 'CYP2C9 inhibition'
    },
    'carbamazepine': {
      tbMeds: ['Isoniazid'],
      severity: 'Major',
      description: 'Isoniazid may increase carbamazepine levels, increasing risk of toxicity.',
      recommendation: 'Monitor carbamazepine levels and watch for signs of toxicity.',
      mechanism: 'CYP3A4 inhibition'
    },
    'ibuprofen': {
      tbMeds: ['Isoniazid'],
      severity: 'Moderate',
      description: 'NSAIDs may increase risk of liver toxicity when combined with Isoniazid.',
      recommendation: 'Use with caution. Monitor liver function tests regularly.',
      mechanism: 'Additive hepatotoxicity'
    },
    'aspirin': {
      tbMeds: ['Isoniazid'],
      severity: 'Moderate',
      description: 'Aspirin may increase risk of liver toxicity when combined with Isoniazid.',
      recommendation: 'Use with caution. Consider acetaminophen as alternative.',
      mechanism: 'Additive hepatotoxicity'
    },
    'metformin': {
      tbMeds: ['Pyrazinamide'],
      severity: 'Monitor',
      description: 'Pyrazinamide may affect blood glucose control.',
      recommendation: 'Monitor blood glucose levels more frequently during TB treatment.',
      mechanism: 'Glucose metabolism effects'
    },
    'insulin': {
      tbMeds: ['Pyrazinamide'],
      severity: 'Monitor',
      description: 'Pyrazinamide may affect blood glucose control, requiring insulin adjustment.',
      recommendation: 'Monitor blood glucose levels closely and adjust insulin as needed.',
      mechanism: 'Glucose metabolism effects'
    },
    'simvastatin': {
      tbMeds: ['Rifampin'],
      severity: 'Moderate',
      description: 'Rifampin reduces simvastatin effectiveness by increasing metabolism.',
      recommendation: 'Consider increasing simvastatin dose or switching to atorvastatin.',
      mechanism: 'CYP3A4 induction'
    },
    'sertraline': {
      tbMeds: ['Rifampin'],
      severity: 'Monitor',
      description: 'Rifampin may reduce sertraline levels, potentially reducing antidepressant efficacy.',
      recommendation: 'Monitor for reduced antidepressant effect. Dose adjustment may be needed.',
      mechanism: 'CYP450 enzyme induction'
    },
    'prednisone': {
      tbMeds: ['Rifampin'],
      severity: 'Monitor',
      description: 'Rifampin reduces corticosteroid effectiveness by increasing metabolism.',
      recommendation: 'May need to increase corticosteroid dose during TB treatment.',
      mechanism: 'CYP3A4 induction'
    },
    'calcium': {
      tbMeds: ['Isoniazid'],
      severity: 'Minor',
      description: 'Calcium may reduce absorption of TB medications if taken together.',
      recommendation: 'Take calcium supplements 2 hours apart from TB medications.',
      mechanism: 'Chelation and absorption interference'
    },
    'iron': {
      tbMeds: ['Isoniazid'],
      severity: 'Minor',
      description: 'Iron may reduce absorption of TB medications if taken together.',
      recommendation: 'Take iron supplements 2 hours apart from TB medications.',
      mechanism: 'Chelation and absorption interference'
    }
  };

  useEffect(() => {
    if (patient) {
      // Load saved medications from localStorage
      const savedMeds = localStorage.getItem(`user_medications_${patient.id}`);
      if (savedMeds) {
        setUserMedications(JSON.parse(savedMeds));
      }
    }
  }, [patient]);

  useEffect(() => {
    if (userMedications.length > 0) {
      analyzeInteractions();
    } else {
      setInteractions([]);
      setSuggestions([]);
    }
  }, [userMedications]); // eslint-disable-line react-hooks/exhaustive-deps

  const searchMedications = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = Object.entries(drugDatabase)
      .filter(([key, drug]) => 
        key.toLowerCase().includes(query.toLowerCase()) ||
        drug.commonNames.some(name => name.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 10)
      .map(([key, drug]) => ({
        id: key,
        name: drug.commonNames[0] || key,
        category: drug.category,
        riskLevel: drug.riskLevel,
        allNames: [key, ...drug.commonNames]
      }));

    setSearchResults(results);
  };

  const addMedication = (medication) => {
    const exists = userMedications.some(med => med.id === medication.id);
    if (exists) {
      toast.error('Medication already added');
      return;
    }

    const newMed = {
      ...medication,
      addedDate: new Date().toISOString(),
      dosage: '',
      frequency: ''
    };

    const updatedMeds = [...userMedications, newMed];
    setUserMedications(updatedMeds);
    
    // Save to localStorage
    if (patient) {
      localStorage.setItem(`user_medications_${patient.id}`, JSON.stringify(updatedMeds));
    }
    
    setNewMedication('');
    setSearchResults([]);
    toast.success(`Added ${medication.name} to your medication list`);
  };

  const removeMedication = (medicationId) => {
    const updatedMeds = userMedications.filter(med => med.id !== medicationId);
    setUserMedications(updatedMeds);
    
    // Save to localStorage
    if (patient) {
      localStorage.setItem(`user_medications_${patient.id}`, JSON.stringify(updatedMeds));
    }
    
    toast.success('Medication removed');
  };

  const analyzeInteractions = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const foundInteractions = [];
    const aiSuggestions = [];

    userMedications.forEach(medication => {
      const interaction = interactionRules[medication.id];
      if (interaction) {
        foundInteractions.push({
          medication: medication.name,
          tbMedications: interaction.tbMeds,
          severity: interaction.severity,
          description: interaction.description,
          recommendation: interaction.recommendation,
          mechanism: interaction.mechanism,
          riskLevel: medication.riskLevel
        });
      }
    });

    // Generate AI-powered suggestions
    if (foundInteractions.length > 0) {
      aiSuggestions.push({
        type: 'monitoring',
        title: 'Enhanced Monitoring Recommended',
        description: `You have ${foundInteractions.length} potential drug interaction(s). Consider more frequent check-ups and lab work.`,
        priority: 'high'
      });
    }

    // Check for hepatotoxic medications
    const hepatotoxicMeds = userMedications.filter(med => 
      ['ibuprofen', 'aspirin', 'acetaminophen'].includes(med.id)
    );
    
    if (hepatotoxicMeds.length > 0) {
      aiSuggestions.push({
        type: 'liver_protection',
        title: 'Liver Health Monitoring',
        description: 'You are taking medications that may affect liver function along with TB drugs. Regular liver function tests are recommended.',
        priority: 'medium'
      });
    }

    // Suggest safe alternatives for problematic medications
    foundInteractions.forEach(interaction => {
      if (interaction.severity === 'Major') {
        if (interaction.medication.toLowerCase().includes('warfarin')) {
          aiSuggestions.push({
            type: 'alternative',
            title: 'Consider Alternative Anticoagulant',
            description: 'Direct oral anticoagulants (DOACs) like apixaban may have fewer interactions with TB medications.',
            priority: 'high'
          });
        }
      }
    });

    // General wellness suggestions
    aiSuggestions.push({
      type: 'wellness',
      title: 'Nutritional Support',
      description: 'Consider adding Vitamin B6 (pyridoxine) supplement to prevent neuropathy from Isoniazid. Consult your doctor first.',
      priority: 'low'
    });

    setInteractions(foundInteractions);
    setSuggestions(aiSuggestions);
    setIsAnalyzing(false);
    
    if (foundInteractions.length > 0) {
      toast.warning(`Found ${foundInteractions.length} potential drug interaction(s). Review recommendations.`);
    } else {
      toast.success('✅ No major drug interactions detected with your current medications!');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'major': return 'bg-red-50 border-red-200 text-red-800';
      case 'moderate': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'monitor': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'minor': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'major': return '🚨';
      case 'moderate': return '⚠️';
      case 'monitor': return '👁️';
      case 'minor': return 'ℹ️';
      default: return '📋';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'safe': return 'text-green-600';
      case 'minor': return 'text-blue-600';
      case 'caution': return 'text-yellow-600';
      case 'monitor': return 'text-orange-600';
      case 'major': return 'text-red-600';
      default: return 'text-gray-600';
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Brain className="mr-3" />
              AI Drug Interaction Checker
            </h2>
            <p className="text-red-100 mt-1">Smart analysis of medication interactions with TB treatment</p>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Shield className="w-6 h-6 mx-auto mb-1" />
              <p className="text-sm font-semibold">AI Powered</p>
            </div>
          </div>
        </div>
      </div>

      {/* TB Medications Display */}
      <div className="p-6 bg-red-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Pill className="w-5 h-5 mr-2 text-red-600" />
          Your TB Medications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tbMedications.map((med, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-red-200">
              <h4 className="font-semibold text-gray-800">{med.name}</h4>
              <p className="text-sm text-gray-600">{med.dosage}</p>
              <p className="text-xs text-gray-500">{med.frequency}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Medication */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-green-600" />
          Add Your Other Medications & Supplements
        </h3>
        
        <div className="relative">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={newMedication}
                onChange={(e) => {
                  setNewMedication(e.target.value);
                  searchMedications(e.target.value);
                }}
                placeholder="Search medications, supplements, vitamins..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => analyzeInteractions()}
              disabled={isAnalyzing || userMedications.length === 0}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              <Brain className="w-4 h-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => addMedication(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{result.name}</p>
                      <p className="text-sm text-gray-600">{result.category}</p>
                    </div>
                    <span className={`text-sm font-medium ${getRiskLevelColor(result.riskLevel)}`}>
                      {result.riskLevel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Medications List */}
      {userMedications.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Your Current Medications ({userMedications.length})
          </h3>
          <div className="space-y-3">
            {userMedications.map((medication) => (
              <div key={medication.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{medication.name}</h4>
                    <p className="text-sm text-gray-600">Category: {medication.category}</p>
                    <span className={`inline-block text-xs font-medium mt-1 ${getRiskLevelColor(medication.riskLevel)}`}>
                      Risk Level: {medication.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => removeMedication(medication.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Analysis Results */}
      {interactions.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Drug Interaction Analysis ({interactions.length})
          </h3>
          
          <div className="space-y-4">
            {interactions.map((interaction, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${getSeverityColor(interaction.severity)}`}>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getSeverityIcon(interaction.severity)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg">
                        {interaction.medication} ↔ {interaction.tbMedications.join(' + ')}
                      </h4>
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-white bg-opacity-50">
                        {interaction.severity} Risk
                      </span>
                    </div>
                    
                    <p className="mb-3 leading-relaxed">{interaction.description}</p>
                    
                    <div className="bg-white bg-opacity-50 p-3 rounded-lg mb-3">
                      <p className="font-semibold mb-1">📋 Recommendation:</p>
                      <p>{interaction.recommendation}</p>
                    </div>
                    
                    <div className="text-sm opacity-75">
                      <p><strong>Mechanism:</strong> {interaction.mechanism}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI-Powered Recommendations
          </h3>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}>
                <div className="flex items-start space-x-3">
                  <div className="text-xl">
                    {suggestion.type === 'monitoring' && '📊'}
                    {suggestion.type === 'liver_protection' && '🛡️'}
                    {suggestion.type === 'alternative' && '🔄'}
                    {suggestion.type === 'wellness' && '💪'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{suggestion.title}</h4>
                    <p className="text-sm leading-relaxed">{suggestion.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50">
                        Priority: {suggestion.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Status Display */}
      {userMedications.length > 0 && interactions.length === 0 && !isAnalyzing && (
        <div className="p-6 border-b">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="text-lg font-semibold text-green-800 mb-1">
                  ✅ No Major Interactions Detected
                </h4>
                <p className="text-green-700">
                  Your current medications appear to be compatible with your TB treatment. Continue taking them as prescribed, but always inform your healthcare providers about all medications you're taking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Information */}
      <div className="p-6 bg-red-50">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-red-600 mt-1" />
          <div>
            <h4 className="font-semibold text-red-800 mb-2">Important Disclaimer</h4>
            <div className="text-sm text-red-700 space-y-2">
              <p>• This AI-powered tool provides educational information only and should not replace professional medical advice.</p>
              <p>• Always consult your doctor or pharmacist before starting, stopping, or changing any medications.</p>
              <p>• Drug interactions can vary based on individual factors like kidney function, liver function, and other health conditions.</p>
              <p>• Report any unusual symptoms or side effects to your healthcare provider immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugInteractionChecker;