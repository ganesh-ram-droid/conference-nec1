import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, ChevronDown, ChevronUp } from 'lucide-react';
import Header from './Header';
import Footer from './Footer'




const Schedule = () => {
  const [expandedSessions, setExpandedSessions] = useState({});

  const toggleSession = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const scheduleData = {
    day1: [
      {
        id: 'inaugural',
        time: '10:00 AM - 11:00 AM',
        title: 'Inaugural Function',
        type: 'plenary'
      },
      {
        id: 'chief-guest',
        time: '11:00 AM - 11:45 AM',
        title: 'Chief Guest Address',
        speaker: 'Shri M. Vellaipandi',
        designation: 'Director General',
        organization: 'Standardisation Testing and Quality Certification Directorate, Ministry of Electronics and Information Technology, Government of India, New Delhi',
        type: 'keynote',
        hasKeynote: true
      },
      {
        id: 'keynote1',
        time: '11:45 AM - 12:45 PM',
        title: 'Keynote Address-Special Guest  ',
        speaker: 'Dr. Lung-Jieh Yang',
        designation: 'Professor',
        organization: 'Department of Mechanical and Electro-Mechanical Engineering, Tamkang University, Taiwan',
        type: 'keynote',
        hasKeynote: true
      },
      {
        id: 'lunch1',
        time: '12:45 PM - 2:00 PM',
        title: 'Lunch Break',
        type: 'break'
      },
      {
        id: 'session1',
        time: '2:00 PM - 4:30 PM',
        title: 'Session 1: Deep Technology & Emerging Innovations',
        speaker: 'Dr. C. Chandra Shekhar',
        designation: 'Professor',
        organization: 'Department of Computer Science & Engineering, IIT Madras, Chennai',
        type: 'parallel',
        hasKeynote: true,
        hasPapers: true
      },
      {
        id: 'session2',
        time: '2:00 PM - 4:30 PM',
        title: 'Session 2: Environment, Climate-Tech & Sustainable Infrastructure',
        speaker: 'Dr. Paolo Sgarbossa',
        designation: 'Professore Associato',
        organization: 'Dipartimento di Ingegneria Industriale - DII, Università degli Studi di Padova, Via F. Marzolo, 9, Padova, Italy',
        type: 'parallel',
        hasKeynote: true,
        hasPapers: true
      }
    ],
    day2: [
      {
        id: 'session3',
        time: '10:00 AM - 11:30 AM',
        title: 'Session 3: Sustainable Transportation & E-Mobility',
        speaker: 'Prof. Anastasios P. Vassilopoulos',
        designation: 'EDCE Director',
        organization: 'Ecole Polytechnique Fédérale de Lausanne, Composite Mechanics Group (GR-MeC), Lausanne',
        type: 'parallel',
        hasKeynote: true,
        hasPapers: true
      },
      {
        id: 'session4',
        time: '10:00 AM - 11:30 AM',
        title: 'Session 4: Advanced Computing & Cyber-Physical Systems',
        speakers: [
          {
            name: 'Dr. Solomon Raju Kota',
            designation: 'Chief Scientist & Head ICTD, CSIR-NAL',
            organization: 'Professor, Academy of Scientific and Innovative Research (AcSIR), Hq: Ghaziabad'
          },
          {
            name: 'Dr. M. Panchamtcharam',
            designation: 'Faculty',
            organization: 'Department of Mathematics and Statistics, IIT Tirupati, Yerpedu-Venkatagiri Road, Tirupati'
          }
        ],
        type: 'parallel',
        hasKeynote: true,
        hasPapers: true
      },
      {
        id: 'session5',
        time: '11:30 AM - 1:00 PM',
        title: 'Session 5: Sustainable Energy & Power Systems',
        speaker: 'Dr. Lung-Jieh Yang',
        designation: 'Professor',
        organization: 'Department of Mechanical and Electro-Mechanical Engineering, Tamkang University, Taiwan',
        type: 'parallel',
        hasKeynote: true,
        hasPapers: true
      },
      {
        id: 'lunch2',
        time: '1:00 PM - 2:00 PM',
        title: 'Lunch Break',
        type: 'break'
      },
      {
        id: 'session6',
        time: '2:00 PM - 4:00 PM',
        title: 'Session 6: Nextgen Communication, VLSI & Embedded Systems',
        speaker: 'Dr. Karthik Ramaswamy',
        designation: 'Senior Technology Leader',
        organization: 'Fermi Silicon Designs Pvt Ltd, Kaikondrahalli, Varthur(h)117, Bellandur, Bangalore',
        type: 'parallel',
        hasKeynote: true,
        hasPapers: true
      },
      {
        id: 'valedictory',
        time: '4:00 PM - 5:00 PM',
        title: 'Valedictory Function',
        type: 'plenary'
      }
    ]
  };

  const SessionCard = ({ session, isExpanded, onToggle }) => {
    const typeStyles = {
      plenary: 'bg-blue-50 border-blue-200',
      keynote: 'bg-blue-100 border-blue-300',
      parallel: 'bg-blue-50 border-blue-200',
      break: 'bg-gray-100 border-gray-200'
    };

    const typeLabels = {
      plenary: 'Plenary',
      keynote: 'Keynote',
      parallel: 'Parallel Session',
      break: 'Break'
    };

    return (
      <div className={`border-2 rounded-lg p-6  mb-6 transition-all duration-200 shadow-sm hover:shadow-md ${typeStyles[session.type]}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">{session.time}</span>
              <span className="text-xs px-3 py-1 bg-white rounded-full border border-blue-300 text-blue-700 font-medium">
                {typeLabels[session.type]}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{session.title}</h3>
            
            {(session.type === 'keynote' || session.type === 'parallel') && (
              <button
                onClick={onToggle}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                aria-expanded={isExpanded}
                aria-controls={`session-details-${session.id}`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show Details
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {isExpanded && (session.type === 'keynote' || session.type === 'parallel') && (
          <div id={`session-details-${session.id}`} className="mt-4 pt-4 border-t border-blue-200">
            {(session.speaker || session.speakers) && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Speaker{session.speakers ? 's' : ''}:</p>
                {session.speakers ? (
                  session.speakers.map((speaker, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">{speaker.name}</p>
                          <p className="text-sm text-gray-600">{speaker.designation}</p>
                          <p className="text-sm text-gray-600">{speaker.organization}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{session.speaker}</p>
                      <p className="text-sm text-gray-600">{session.designation}</p>
                      <p className="text-sm text-gray-600">{session.organization}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {session.hasPapers && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <p className="text-sm font-medium text-blue-700">📄 Paper Presentations</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
     

      {/* Schedule Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-32">
        {/* Page Title */}
        <div className="bg-gradient-to-r   from-[#4ebceb] via-[#3aa3d9] to-[#2086ca]    text-white py-8 px-6 mb-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Conference Schedule</h1>
          <p className="text-sm sm:text-base text-blue-100 mt-2">March 26-27, 2025-2026</p>
        </div>

        {/* Day 1 */}
        <div className="mb-12">
          <div className="bg-gradient-to-r px-3.5  from-[#4ebceb] via-[#3aa3d9] to-[#2086ca]    text-white rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Calendar className="w-7 h-7" />
              Day 1 - March 26, 2025
            </h2>
          </div>
          {scheduleData.day1.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              isExpanded={expandedSessions[session.id]}
              onToggle={() => toggleSession(session.id)}
            />
          ))}
        </div>

        {/* Day 2 */}
        <div className="mb-12">
          <div className="bg-gradient-to-r px-3.5  from-[#4ebceb] via-[#3aa3d9] to-[#2086ca]    text-white rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Calendar className="w-7 h-7" />
              Day 2 - March 27, 2026
            </h2>
          </div>
          {scheduleData.day2.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              isExpanded={expandedSessions[session.id]}
              onToggle={() => toggleSession(session.id)}
            />
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default Schedule;