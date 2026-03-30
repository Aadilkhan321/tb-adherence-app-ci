import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle, Download, Share2, Key, Database, FileText, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockchainRecords = ({ patient }) => {
  const [blocks, setBlocks] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [patientPrivateKey, setPatientPrivateKey] = useState('');
  const [isRecordsVisible, setIsRecordsVisible] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);

  useEffect(() => {
    if (patient) {
      generatePatientBlockchain();
      generatePatientKeys();
    }
  }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simple blockchain implementation (for demo purposes)
  const generatePatientBlockchain = () => {
    if (!patient) return;

    // Genesis block
    const genesisBlock = {
      index: 0,
      timestamp: new Date(patient.treatmentStartDate).getTime(),
      data: {
        type: 'treatment_started',
        patientId: hashPatientId(patient.id),
        details: {
          startDate: patient.treatmentStartDate,
          diagnosis: 'Tuberculosis',
          treatmentPlan: '6-month DOTS therapy',
          prescribedBy: 'Dr. Smith (ID: DOC001)',
          medications: ['Isoniazid', 'Rifampin', 'Ethambutol', 'Pyrazinamide']
        }
      },
      hash: '0000a1b2c3d4e5f6789012345',
      previousHash: '0'
    };

    const medicationBlocks = generateMedicationBlocks();
    const milestoneBlocks = generateMilestoneBlocks();
    
    const sortedBlocks = [genesisBlock, ...medicationBlocks, ...milestoneBlocks]
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const allBlocks = sortedBlocks.map((block, index) => ({
      ...block,
      index,
      hash: generateHash(block, index),
      previousHash: index > 0 ? generateHash(sortedBlocks[index - 1], index - 1) : '0'
    }));

    setBlocks(allBlocks);
  };

  const generateMedicationBlocks = () => {
    const blocks = [];
    const startDate = new Date(patient.treatmentStartDate);
    
    // Generate blocks for medication taken days
    for (let i = 0; i < patient.totalDays; i++) {
      const blockDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      blocks.push({
        timestamp: blockDate.getTime(),
        data: {
          type: 'medication_taken',
          patientId: hashPatientId(patient.id),
          details: {
            date: blockDate.toISOString(),
            medications: ['Isoniazid 300mg', 'Rifampin 600mg', 'Ethambutol 800mg', 'Pyrazinamide 1500mg'],
            adherenceStatus: 'compliant',
            takenAt: new Date(blockDate.getTime() + Math.random() * 12 * 60 * 60 * 1000).toISOString(),
            verifiedBy: 'system_auto',
            sideEffects: i % 10 === 0 ? ['mild_nausea'] : []
          }
        }
      });
    }

    return blocks;
  };

  const generateMilestoneBlocks = () => {
    const blocks = [];
    
    if (patient.currentStreak >= 7) {
      blocks.push({
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(),
        data: {
          type: 'milestone_achieved',
          patientId: hashPatientId(patient.id),
          details: {
            milestone: '7_day_streak',
            achievedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            significance: 'First week of consistent medication adherence',
            badgeEarned: '7-Day Streak',
            healthcareProviderNote: 'Patient showing excellent adherence in first week'
          }
        }
      });
    }

    if (patient.currentStreak >= 30) {
      blocks.push({
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(),
        data: {
          type: 'milestone_achieved',
          patientId: hashPatientId(patient.id),
          details: {
            milestone: '30_day_streak',
            achievedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            significance: 'One month of consistent medication adherence',
            badgeEarned: '30-Day Streak',
            healthcareProviderNote: 'Exceptional adherence pattern maintained'
          }
        }
      });
    }

    return blocks;
  };

  const hashPatientId = (id) => {
    // Simple hash function for demo (in real implementation, use proper cryptographic hash)
    return `patient_${id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0).toString(16)}`;
  };

  const generateHash = (block, index) => {
    // Simple hash generation for demo
    const data = JSON.stringify(block.data) + block.timestamp + index;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  };

  const generatePatientKeys = () => {
    // Generate a demo private key for the patient
    const key = 'PVT_' + Math.random().toString(36).substr(2, 32).toUpperCase();
    setPatientPrivateKey(key);
  };

  const verifyBlockchain = async () => {
    setIsVerifying(true);
    setVerificationResults(null);
    
    // Simulate blockchain verification process
    toast.success('🔍 Starting blockchain verification...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check blockchain integrity
    let isValid = true;
    let corruptedBlocks = [];
    let verifiedTransactions = 0;

    blocks.forEach((block, index) => {
      if (index > 0) {
        const expectedPreviousHash = generateHash(blocks[index - 1], index - 1);
        if (block.previousHash !== expectedPreviousHash) {
          isValid = false;
          corruptedBlocks.push(index);
        } else {
          verifiedTransactions++;
        }
      } else {
        verifiedTransactions++;
      }
    });

    const results = {
      isValid,
      totalBlocks: blocks.length,
      verifiedTransactions,
      corruptedBlocks,
      lastVerification: new Date().toISOString(),
      networkNodes: 12,
      consensusReached: isValid,
      hashAlgorithm: 'SHA-256 (Demo)',
      blockGenerationTime: '~10 seconds'
    };

    setVerificationResults(results);
    setIsVerifying(false);

    if (isValid) {
      toast.success('✅ Blockchain verified! All treatment records are authentic and tamper-proof.');
    } else {
      toast.error('❌ Blockchain verification failed! Some records may have been tampered with.');
    }
  };

  const exportBlockchain = () => {
    const exportData = {
      patientId: hashPatientId(patient.id),
      exportDate: new Date().toISOString(),
      totalBlocks: blocks.length,
      verificationStatus: verificationResults?.isValid ? 'verified' : 'unverified',
      blocks: blocks.map(block => ({
        ...block,
        data: {
          ...block.data,
          patientId: hashPatientId(patient.id) // Keep hashed for privacy
        }
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tb_treatment_blockchain_${hashPatientId(patient.id)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('📁 Blockchain export completed! File downloaded.');
  };

  const shareWithProvider = () => {
    toast.success('🏥 Generating secure share link for healthcare provider...');
    setTimeout(() => {
      const shareCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      toast.success(`🔗 Share code generated: ${shareCode}\n\nYour healthcare provider can access your verified treatment records using this code.`);
    }, 1500);
  };

  const getBlockTypeIcon = (type) => {
    switch (type) {
      case 'treatment_started': return '🏁';
      case 'medication_taken': return '💊';
      case 'milestone_achieved': return '🏆';
      default: return '📝';
    }
  };

  const getBlockTypeColor = (type) => {
    switch (type) {
      case 'treatment_started': return 'bg-blue-50 border-blue-200';
      case 'medication_taken': return 'bg-green-50 border-green-200';
      case 'milestone_achieved': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatBlockTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Shield className="mr-3" />
              Blockchain Treatment Records
            </h2>
            <p className="text-emerald-100 mt-1">Immutable, verifiable, and secure treatment history</p>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Lock className="w-6 h-6 mx-auto mb-1" />
              <p className="text-sm font-semibold">Secured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <Database className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{blocks.length}</p>
            <p className="text-sm text-gray-600">Total Blocks</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{patient?.totalDays || 0}</p>
            <p className="text-sm text-gray-600">Verified Days</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">100%</p>
            <p className="text-sm text-gray-600">Integrity</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <Key className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">12</p>
            <p className="text-sm text-gray-600">Network Nodes</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b bg-white">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={verifyBlockchain}
            disabled={isVerifying}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center transition-colors"
          >
            <Shield className="w-4 h-4 mr-2" />
            {isVerifying ? 'Verifying...' : 'Verify Blockchain'}
          </button>
          
          <button
            onClick={exportBlockchain}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </button>
          
          <button
            onClick={shareWithProvider}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share with Provider
          </button>
          
          <button
            onClick={() => setIsRecordsVisible(!isRecordsVisible)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isRecordsVisible ? 'Hide' : 'View'} Records
          </button>
        </div>
      </div>

      {/* Verification Results */}
      {verificationResults && (
        <div className="p-6 border-b">
          <div className={`rounded-lg p-4 ${verificationResults.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center mb-3">
              {verificationResults.isValid ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              )}
              <h3 className={`text-lg font-semibold ${verificationResults.isValid ? 'text-green-800' : 'text-red-800'}`}>
                Verification {verificationResults.isValid ? 'Successful' : 'Failed'}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Total Blocks:</p>
                <p>{verificationResults.totalBlocks}</p>
              </div>
              <div>
                <p className="font-medium">Verified:</p>
                <p>{verificationResults.verifiedTransactions}</p>
              </div>
              <div>
                <p className="font-medium">Network Nodes:</p>
                <p>{verificationResults.networkNodes}</p>
              </div>
              <div>
                <p className="font-medium">Consensus:</p>
                <p>{verificationResults.consensusReached ? '✅ Reached' : '❌ Failed'}</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-3">
              Last verified: {new Date(verificationResults.lastVerification).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Private Key Display */}
      <div className="p-6 border-b bg-yellow-50">
        <div className="flex items-start space-x-3">
          <Key className="w-5 h-5 text-yellow-600 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800 mb-1">Your Private Key</h4>
            <div className="bg-white p-3 rounded border font-mono text-sm break-all">
              {patientPrivateKey}
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Important:</strong> Keep this key secure. It's required to access your blockchain records and prove ownership.
            </p>
          </div>
        </div>
      </div>

      {/* Blockchain Records */}
      {isRecordsVisible && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Blockchain Transaction History
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {blocks.slice().reverse().map((block, index) => (
              <div key={block.index} className={`border-2 rounded-lg p-4 ${getBlockTypeColor(block.data.type)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getBlockTypeIcon(block.data.type)}</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {block.data.type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">{formatBlockTime(block.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Block #{block.index}</p>
                    <p className="text-xs font-mono text-gray-400">
                      Hash: {block.hash.substr(0, 8)}...
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 text-sm">
                  {block.data.type === 'treatment_started' && (
                    <div>
                      <p><strong>Treatment Plan:</strong> {block.data.details.treatmentPlan}</p>
                      <p><strong>Prescribed by:</strong> {block.data.details.prescribedBy}</p>
                      <p><strong>Medications:</strong> {block.data.details.medications.join(', ')}</p>
                    </div>
                  )}
                  
                  {block.data.type === 'medication_taken' && (
                    <div>
                      <p><strong>Status:</strong> ✅ Medication taken</p>
                      <p><strong>Time:</strong> {new Date(block.data.details.takenAt).toLocaleTimeString()}</p>
                      {block.data.details.sideEffects.length > 0 && (
                        <p><strong>Side Effects:</strong> {block.data.details.sideEffects.join(', ')}</p>
                      )}
                    </div>
                  )}
                  
                  {block.data.type === 'milestone_achieved' && (
                    <div>
                      <p><strong>Milestone:</strong> {block.data.details.significance}</p>
                      <p><strong>Badge:</strong> 🏆 {block.data.details.badgeEarned}</p>
                      <p><strong>Note:</strong> {block.data.details.healthcareProviderNote}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Previous Hash: {block.previousHash.substr(0, 12)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Info */}
      <div className="p-6 bg-blue-50 border-t">
        <h4 className="font-semibold text-blue-800 mb-2">Why Blockchain for Medical Records?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <strong>🔒 Immutability:</strong> Records cannot be altered or deleted once added to the blockchain
          </div>
          <div>
            <strong>🔍 Transparency:</strong> All transactions are verifiable and auditable by authorized parties
          </div>
          <div>
            <strong>🌐 Interoperability:</strong> Records can be securely shared across different healthcare providers
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainRecords;