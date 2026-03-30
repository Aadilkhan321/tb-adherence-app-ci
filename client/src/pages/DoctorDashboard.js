import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DoctorDashboard = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [reportType] = useState('summary');

  useEffect(() => {
    loadPatientsData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPatientsData = async () => {
    try {
      // Load all patients assigned to this doctor
      const doctorPatients = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('patients_')) {
          const patientData = JSON.parse(localStorage.getItem(key));
          if (patientData.doctorId === user.uid) {
            // Calculate adherence statistics
            const adherenceStats = await calculateAdherenceStats(patientData.id);
            doctorPatients.push({
              ...patientData,
              ...adherenceStats
            });
          }
        }
      }

      setPatients(doctorPatients);
      generateAnalytics(doctorPatients);
    } catch (error) {
      console.error('Error loading patients data:', error);
      toast.error('Failed to load patients data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAdherenceStats = async (patientId) => {
    const logs = [];
    const last30Days = [];
    const today = new Date();
    
    // Get medication logs for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const logKey = `medication_logs_${patientId}_${dateString}`;
      const log = localStorage.getItem(logKey);
      
      last30Days.push({
        date: dateString,
        taken: !!log
      });
      
      if (log) {
        logs.push(JSON.parse(log));
      }
    }

    const adherenceRate = last30Days.length > 0 ? 
      (last30Days.filter(day => day.taken).length / last30Days.length * 100) : 0;
    
    const missedDoses = last30Days.filter(day => !day.taken).length;
    const lastMedicationDate = logs.length > 0 ? 
      new Date(Math.max(...logs.map(log => new Date(log.date).getTime()))) : null;
    
    return {
      adherenceRate: Math.round(adherenceRate),
      missedDoses,
      lastMedicationDate,
      last30DaysData: last30Days.reverse() // Reverse to show chronologically
    };
  };

  const generateAnalytics = (patientsData) => {
    if (patientsData.length === 0) {
      setAnalytics(null);
      return;
    }

    const totalPatients = patientsData.length;
    const avgAdherence = patientsData.reduce((sum, p) => sum + p.adherenceRate, 0) / totalPatients;
    const highRiskPatients = patientsData.filter(p => p.adherenceRate < 70).length;
    const excellentAdherence = patientsData.filter(p => p.adherenceRate >= 90).length;

    // Generate chart data
    const adherenceDistribution = {
      labels: ['Excellent (90-100%)', 'Good (80-89%)', 'Fair (70-79%)', 'Poor (<70%)'],
      datasets: [{
        data: [
          patientsData.filter(p => p.adherenceRate >= 90).length,
          patientsData.filter(p => p.adherenceRate >= 80 && p.adherenceRate < 90).length,
          patientsData.filter(p => p.adherenceRate >= 70 && p.adherenceRate < 80).length,
          patientsData.filter(p => p.adherenceRate < 70).length,
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }]
    };

    // Patient adherence comparison
    const patientComparison = {
      labels: patientsData.map(p => p.name.split(' ')[0]), // First name only
      datasets: [{
        label: 'Adherence Rate (%)',
        data: patientsData.map(p => p.adherenceRate),
        backgroundColor: patientsData.map(p => p.adherenceRate >= 70 ? '#10B981' : '#EF4444'),
        borderColor: patientsData.map(p => p.adherenceRate >= 70 ? '#059669' : '#DC2626'),
        borderWidth: 1
      }]
    };

    setAnalytics({
      totalPatients,
      avgAdherence: Math.round(avgAdherence),
      highRiskPatients,
      excellentAdherence,
      adherenceDistribution,
      patientComparison
    });
  };

  const getPatientStatus = (patient) => {
    if (patient.adherenceRate >= 90) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (patient.adherenceRate >= 80) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (patient.adherenceRate >= 70) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPatientTrendData = (patient) => {
    if (!patient.last30DaysData) return null;

    return {
      labels: patient.last30DaysData.map(day => {
        const date = new Date(day.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{
        label: 'Medication Taken',
        data: patient.last30DaysData.map(day => day.taken ? 1 : 0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value) {
            return value === 1 ? 'Taken' : 'Missed';
          }
        }
      }
    }
  };

  // Generate comprehensive report
  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      doctorName: user.name,
      reportType,
      totalPatients: patients.length,
      analytics: analytics,
      patients: patients.map(p => ({
        name: p.name,
        email: p.email,
        adherenceRate: p.adherenceRate,
        currentStreak: p.currentStreak,
        totalDays: p.totalDays,
        missedDoses: p.missedDoses,
        lastMedication: p.lastMedicationDate,
        treatmentStartDate: p.treatmentStartDate,
        badges: p.badges?.length || 0,
        language: p.language,
        status: getPatientStatus(p).status
      }))
    };
    
    setReportData(reportData);
    setShowReportModal(true);
    toast.success('Report generated successfully!');
  };

  // Export report as JSON or print-friendly format
  const exportReport = (format) => {
    if (!reportData) return;
    
    if (format === 'json') {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `tb_adherence_report_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Report exported as JSON!');
    } else if (format === 'print') {
      window.print();
    }
  };

  // Send bulk reminders
  const sendBulkReminders = () => {
    const targetPatients = selectedPatients.length > 0 ? 
      patients.filter(p => selectedPatients.includes(p.id)) :
      patients.filter(p => p.adherenceRate < 70); // Default to high-risk patients
    
    if (targetPatients.length === 0) {
      toast.error('No patients selected for reminders');
      return;
    }

    // Simulate sending reminders
    targetPatients.forEach(patient => {
      // In real app, this would call an API or notification service
      console.log(`Sending reminder to ${patient.name} (${patient.email}) in ${patient.language}`);
    });
    
    toast.success(`Sent reminders to ${targetPatients.length} patient${targetPatients.length > 1 ? 's' : ''}!`);
    setShowReminderModal(false);
    setSelectedPatients([]);
  };

  // Add new patient (demo functionality)
  const addNewPatient = (patientData) => {
    const newPatient = {
      id: 'patient_' + Date.now(),
      doctorId: user.uid,
      currentStreak: 0,
      totalDays: 0,
      lastMedication: null,
      treatmentStartDate: new Date().toISOString(),
      badges: ['Getting Started'],
      language: 'en',
      adherenceRate: 0,
      missedDoses: 0,
      last30DaysData: [],
      ...patientData
    };
    
    // Store in localStorage (in real app, would save to database)
    localStorage.setItem(`patients_${newPatient.id}`, JSON.stringify(newPatient));
    
    // Reload patients data
    loadPatientsData();
    setShowAddPatientModal(false);
    toast.success(`Patient ${patientData.name} added successfully!`);
  };

  // Toggle patient selection for bulk actions
  const togglePatientSelection = (patientId) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  // Get risk level color
  const getRiskColor = (adherenceRate) => {
    if (adherenceRate >= 90) return 'text-green-600';
    if (adherenceRate >= 80) return 'text-blue-600';
    if (adherenceRate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Doctor Dashboard 👨‍⚕️
          </h1>
          <p className="text-pink-200">
            Monitor and support your TB patients' medication adherence
          </p>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
                  <p className="text-3xl font-bold text-primary">{analytics.totalPatients}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Avg Adherence</h3>
                  <p className={`text-3xl font-bold ${analytics.avgAdherence >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {analytics.avgAdherence}%
                  </p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">High Risk</h3>
                  <p className="text-3xl font-bold text-red-600">{analytics.highRiskPatients}</p>
                  <p className="text-sm text-gray-500">patients &lt;70%</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Excellent</h3>
                  <p className="text-3xl font-bold text-green-600">{analytics.excellentAdherence}</p>
                  <p className="text-sm text-gray-500">patients ≥90%</p>
                </div>
                <div className="text-4xl">🌟</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Adherence Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Adherence Distribution</h3>
              <div className="h-64">
                <Doughnut 
                  data={analytics.adherenceDistribution} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Patient Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Adherence Comparison</h3>
              <div className="h-64">
                <Bar 
                  data={analytics.patientComparison} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Patient Overview</h2>
            <p className="text-gray-600 mt-1">Click on a patient to view detailed adherence trends</p>
          </div>

          {patients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">No Patients Found</h3>
              <p>No patients are currently assigned to you.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {patients.map((patient) => {
                const statusInfo = getPatientStatus(patient);
                const daysSinceLastMed = patient.lastMedicationDate ? 
                  Math.floor((new Date() - new Date(patient.lastMedicationDate)) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <div key={patient.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                       onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              Treatment Day: {patient.totalDays}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {patient.adherenceRate}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Streak: {patient.currentStreak} days
                        </div>
                        <div className="text-sm text-gray-500">
                          Missed: {patient.missedDoses} doses
                        </div>
                        {daysSinceLastMed !== null && (
                          <div className={`text-sm font-medium mt-1 ${daysSinceLastMed > 1 ? 'text-red-600' : 'text-green-600'}`}>
                            {daysSinceLastMed === 0 ? 'Today' : 
                             daysSinceLastMed === 1 ? 'Yesterday' : 
                             `${daysSinceLastMed} days ago`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded patient details */}
                    {selectedPatient?.id === patient.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Patient Info */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Patient Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Treatment Started:</span>
                                <span className="font-medium">
                                  {new Date(patient.treatmentStartDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Language Preference:</span>
                                <span className="font-medium">
                                  {patient.language === 'hi' ? 'Hindi' : 'English'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Badges:</span>
                                <span className="font-medium">{patient.badges?.length || 0}</span>
                              </div>
                            </div>

                            {/* Badges */}
                            {patient.badges && patient.badges.length > 0 && (
                              <div className="mt-4">
                                <h5 className="text-md font-semibold text-gray-800 mb-2">Current Badges</h5>
                                <div className="flex flex-wrap gap-2">
                                  {patient.badges.map((badge, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Adherence Trend Chart */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">30-Day Adherence Trend</h4>
                            <div className="h-48">
                              <Line data={getPatientTrendData(patient)} options={chartOptions} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={generateReport}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                <div className="font-semibold text-gray-800 group-hover:text-primary">Generate Report</div>
                <div className="text-sm text-gray-500">Export patient data</div>
              </div>
            </button>
            
            <button 
              onClick={() => setShowReminderModal(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📱</div>
                <div className="font-semibold text-gray-800 group-hover:text-primary">Send Reminders</div>
                <div className="text-sm text-gray-500">Bulk notifications</div>
              </div>
            </button>
            
            <button 
              onClick={() => setShowAddPatientModal(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <div className="font-semibold text-gray-800 group-hover:text-primary">Add Patient</div>
                <div className="text-sm text-gray-500">Register new patient</div>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Assessment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Risk Assessment</h3>
            <div className="space-y-3">
              {patients.filter(p => p.adherenceRate < 70).slice(0, 3).map(patient => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-gray-800">{patient.name}</span>
                  </div>
                  <span className="text-red-600 font-bold">{patient.adherenceRate}%</span>
                </div>
              ))}
              {patients.filter(p => p.adherenceRate < 70).length === 0 && (
                <p className="text-green-600 text-center py-4">🎉 No high-risk patients!</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {patients.sort((a, b) => new Date(b.lastMedicationDate || 0) - new Date(a.lastMedicationDate || 0))
                .slice(0, 5).map(patient => {
                  const daysSince = patient.lastMedicationDate ? 
                    Math.floor((new Date() - new Date(patient.lastMedicationDate)) / (1000 * 60 * 60 * 24)) : null;
                  
                  return (
                    <div key={patient.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-primary`}>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-800">{patient.name}</span>
                      </div>
                      <span className={`text-sm ${
                        daysSince === 0 ? 'text-green-600' : 
                        daysSince === 1 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {daysSince === 0 ? 'Today' : 
                         daysSince === 1 ? 'Yesterday' : 
                         daysSince ? `${daysSince}d ago` : 'Never'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Patient Adherence Report</h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                {reportData && (
                  <div className="space-y-6">
                    {/* Report Header */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Generated By</p>
                          <p className="font-semibold">{reportData.doctorName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-semibold">{new Date(reportData.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Patients</p>
                          <p className="font-semibold">{reportData.totalPatients}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Adherence</p>
                          <p className={`font-semibold ${getRiskColor(reportData.analytics?.avgAdherence || 0)}`}>
                            {reportData.analytics?.avgAdherence || 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Patient Summary Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adherence</th>
                            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.patients.map((patient, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="py-2 px-4 border-b">
                                <div>
                                  <p className="font-medium text-gray-900">{patient.name}</p>
                                  <p className="text-sm text-gray-500">{patient.email}</p>
                                </div>
                              </td>
                              <td className="py-2 px-4 border-b">
                                <span className={`font-semibold ${getRiskColor(patient.adherenceRate)}`}>
                                  {patient.adherenceRate}%
                                </span>
                              </td>
                              <td className="py-2 px-4 border-b">{patient.currentStreak} days</td>
                              <td className="py-2 px-4 border-b">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  patient.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                                  patient.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                                  patient.status === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {patient.status}
                                </span>
                              </td>
                              <td className="py-2 px-4 border-b">{patient.language === 'hi' ? 'Hindi' : 'English'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Export Options */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => exportReport('print')}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        🖨️ Print Report
                      </button>
                      <button
                        onClick={() => exportReport('json')}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        💾 Download JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {showReminderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Send Bulk Reminders</h3>
                  <button
                    onClick={() => setShowReminderModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Select Patients:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {patients.map(patient => (
                        <label key={patient.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedPatients.includes(patient.id)}
                            onChange={() => togglePatientSelection(patient.id)}
                            className="form-checkbox h-4 w-4 text-primary"
                          />
                          <span className="flex-1">{patient.name}</span>
                          <span className={`text-sm ${getRiskColor(patient.adherenceRate)}`}>
                            {patient.adherenceRate}%
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 If no patients are selected, reminders will be sent to all high-risk patients (&lt;70% adherence)
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowReminderModal(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendBulkReminders}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                    >
                      📱 Send Reminders
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Patient Modal */}
        {showAddPatientModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Add New Patient</h3>
                  <button
                    onClick={() => setShowAddPatientModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const patientData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    language: formData.get('language')
                  };
                  addNewPatient(patientData);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter patient's full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter patient's email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language Preference</label>
                    <select
                      name="language"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddPatientModal(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                    >
                      👥 Add Patient
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;