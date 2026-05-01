import { createContext, useContext, useReducer, useMemo } from 'react';

const ResumeContext = createContext();

const initialState = {
  _historyId: null,
  personal: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    website: '',
    jobTitle: '',
  },
  summary: '',
  experience: [
    {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  ],
  education: [
    {
      id: Date.now() + 1,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      gradeType: 'CGPA',
    },
  ],
  skills: [],
  certifications: [],
  projects: [
    {
      id: Date.now() + 2,
      name: '',
      description: '',
      technologies: '',
      link: '',
    },
  ],
};

function resumeReducer(state, action) {
  switch (action.type) {
    case 'SET_PERSONAL':
      return { ...state, personal: { ...state.personal, ...action.payload } };

    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };

    case 'SET_EXPERIENCE':
      return { ...state, experience: action.payload };

    case 'ADD_EXPERIENCE':
      return {
        ...state,
        experience: [
          ...state.experience,
          {
            id: Date.now(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
          },
        ],
      };

    case 'REMOVE_EXPERIENCE':
      return {
        ...state,
        experience: state.experience.filter((e) => e.id !== action.payload),
      };

    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        experience: state.experience.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.data } : e
        ),
      };

    case 'SET_EDUCATION':
      return { ...state, education: action.payload };

    case 'ADD_EDUCATION':
      return {
        ...state,
        education: [
          ...state.education,
          {
            id: Date.now(),
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: '',
            gradeType: 'CGPA',
          },
        ],
      };

    case 'REMOVE_EDUCATION':
      return {
        ...state,
        education: state.education.filter((e) => e.id !== action.payload),
      };

    case 'UPDATE_EDUCATION':
      return {
        ...state,
        education: state.education.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.data } : e
        ),
      };

    case 'SET_SKILLS':
      return { ...state, skills: action.payload };

    case 'ADD_SKILL':
      if (state.skills.includes(action.payload)) return state;
      return { ...state, skills: [...state.skills, action.payload] };

    case 'REMOVE_SKILL':
      return {
        ...state,
        skills: state.skills.filter((s) => s !== action.payload),
      };

    case 'SET_CERTIFICATIONS':
      return { ...state, certifications: action.payload };

    case 'ADD_CERTIFICATION':
      return {
        ...state,
        certifications: [...state.certifications, action.payload],
      };

    case 'REMOVE_CERTIFICATION':
      return {
        ...state,
        certifications: state.certifications.filter(
          (c) => c !== action.payload
        ),
      };

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [
          ...state.projects,
          {
            id: Date.now(),
            name: '',
            description: '',
            technologies: '',
            link: '',
          },
        ],
      };

    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.data } : p
        ),
      };

    case 'SET_ALL':
      return { ...state, ...action.payload };

    case 'SET_HISTORY_ID':
      return { ...state, _historyId: action.payload };

    case 'RESET':
      return { ...initialState, _historyId: null };

    default:
      return state;
  }
}

export function ResumeProvider({ children }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
