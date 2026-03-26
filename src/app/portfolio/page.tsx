'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  Mail,
  ExternalLink,
  Zap,
  TrendingUp,
  Award,
  Code,
  Briefcase,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';

// Types
interface Profile {
  name: string;
  title: string;
  location: string;
  bio: string;
  profileImage: string | null;
  github: string;
  linkedin: string;
  blog: string;
  email: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  techStack: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  image: string | null;
}

interface Skill {
  id: string;
  category: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
}

interface Education {
  id: string;
  university: string;
  degree: string;
  period: string;
}

// Mock Data
const mockProfile: Profile = {
  name: '정은지',
  title: 'DevOps/SRE Engineer',
  location: 'Seoul, Korea',
  bio: 'Passionate about building scalable infrastructure and improving system reliability. 5+ years of experience with Kubernetes, Terraform, and cloud-native technologies.',
  profileImage: null,
  github: 'https://github.com/eunji',
  linkedin: 'https://linkedin.com/in/eunji',
  blog: 'https://blog.example.com',
  email: 'eunji@example.com',
};

const mockExperience: ExperienceEntry[] = [
  {
    id: '1',
    company: 'Naver',
    role: 'Senior SRE Engineer',
    period: '2022 - Present',
    description:
      'Led infrastructure optimization reducing cloud costs by 35%. Designed and implemented automated deployment pipeline for 200+ microservices.',
    techStack: ['Kubernetes', 'Terraform', 'Prometheus', 'ELK Stack'],
  },
  {
    id: '2',
    company: 'Kakao',
    role: 'DevOps Engineer',
    period: '2020 - 2022',
    description:
      'Managed 500+ production servers on AWS. Implemented observability solutions reducing incident detection time by 60%.',
    techStack: ['AWS', 'Docker', 'Jenkins', 'Grafana'],
  },
  {
    id: '3',
    company: 'LINE',
    role: 'Systems Engineer',
    period: '2018 - 2020',
    description:
      'Built internal tools for team productivity. Improved system reliability from 99.5% to 99.99% uptime.',
    techStack: ['Linux', 'Python', 'Nginx', 'PostgreSQL'],
  },
];

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Kubernetes Multi-Cluster Management',
    description:
      'Built a unified management platform for multi-cloud Kubernetes clusters with automated scaling and disaster recovery.',
    techStack: ['Kubernetes', 'Go', 'React', 'PostgreSQL'],
    githubUrl: 'https://github.com/eunji/k8s-multi-cluster',
    liveUrl: 'https://k8s-management.example.com',
    image: null,
  },
  {
    id: '2',
    title: 'Infrastructure as Code Framework',
    description:
      'Developed reusable Terraform modules for provisioning cloud infrastructure, reducing deployment time by 70%.',
    techStack: ['Terraform', 'AWS', 'Python'],
    githubUrl: 'https://github.com/eunji/terraform-framework',
    liveUrl: '',
    image: null,
  },
  {
    id: '3',
    title: 'Real-time Monitoring Dashboard',
    description:
      'Created comprehensive monitoring dashboard aggregating metrics from Prometheus, providing real-time visibility into system health.',
    techStack: ['React', 'Prometheus', 'Grafana', 'Node.js'],
    githubUrl: 'https://github.com/eunji/monitoring-dashboard',
    liveUrl: 'https://monitoring.example.com',
    image: null,
  },
];

const mockSkills: Skill[] = [
  // Infrastructure
  { id: '1', category: 'Infrastructure', name: 'Kubernetes', level: 'Expert' },
  { id: '2', category: 'Infrastructure', name: 'Docker', level: 'Expert' },
  { id: '3', category: 'Infrastructure', name: 'Linux', level: 'Advanced' },

  // Cloud
  { id: '4', category: 'Cloud', name: 'AWS', level: 'Advanced' },
  { id: '5', category: 'Cloud', name: 'GCP', level: 'Intermediate' },
  { id: '6', category: 'Cloud', name: 'Azure', level: 'Intermediate' },

  // Tools & Platforms
  { id: '7', category: 'Tools & Platforms', name: 'Terraform', level: 'Expert' },
  { id: '8', category: 'Tools & Platforms', name: 'Ansible', level: 'Advanced' },
  { id: '9', category: 'Tools & Platforms', name: 'Jenkins', level: 'Advanced' },

  // Monitoring
  { id: '10', category: 'Monitoring', name: 'Prometheus', level: 'Advanced' },
  { id: '11', category: 'Monitoring', name: 'Grafana', level: 'Advanced' },
  { id: '12', category: 'Monitoring', name: 'ELK Stack', level: 'Intermediate' },

  // Programming
  { id: '13', category: 'Programming', name: 'Python', level: 'Advanced' },
  { id: '14', category: 'Programming', name: 'Go', level: 'Intermediate' },
  { id: '15', category: 'Programming', name: 'Bash', level: 'Expert' },
];

const mockCertifications: Certification[] = [
  { id: '1', title: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF', date: '2023' },
  { id: '2', title: 'AWS Solutions Architect - Associate', issuer: 'AWS', date: '2022' },
  { id: '3', title: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp', date: '2022' },
];

const mockEducation: Education[] = [
  {
    id: '1',
    university: 'Seoul National University',
    degree: 'B.S. in Computer Science',
    period: '2014 - 2018',
  },
];

export default function PortfolioPage() {
  // States
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>(mockExperience);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [certifications, setCertifications] = useState<Certification[]>(mockCertifications);
  const [education, setEducation] = useState<Education[]>(mockEducation);

  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  // AI Suggestion Mock Functions
  const showAISuggestion = (type: string) => {
    const suggestions: Record<string, string> = {
      bio: '전문 용어와 경험 기간을 강조하면 더 좋아요. "15년 이상의 경험"과 같이 구체적인 숫자를 포함하세요.',
      experience:
        '프로젝트의 영향도를 더 명확히 하세요. "비용 35% 절감"처럼 양적인 결과를 강조하면 채용담당자들에게 더 어필됩니다.',
      projects:
        '사용자 수나 일일 활동량 같은 메트릭을 추가하세요. "월 10만+ 사용자 서빙" 같은 스케일 정보가 있으면 더욱 임팩트 있습니다.',
      skills: '당신의 기술 스택은 좋지만 클라우드 보안(Cloud Security) 관련 기술을 추가하면 시니어 역할에 더 경쟁력이 있을 거예요.',
      score: '포트폴리오 점수: 82/100. 개선 사항: Open Source 기여, 블로그 글 작성, 아키텍처 다이어그램 추가',
    };
    setActiveSuggestion(type);
    setAiSuggestion(suggestions[type] || 'AI 제안을 생성 중입니다...');
  };

  const scoreChecklist = [
    { item: 'System Design 경험 시연', checked: true },
    { item: 'Open Source 기여', checked: false },
    { item: '프로젝트 설명에 영향도 메트릭 포함', checked: true },
    { item: '정량화된 성과', checked: true },
    { item: '기술 블로그', checked: false },
    { item: '컨퍼런스 발표 경험', checked: false },
    { item: '안정성 개선 사례', checked: true },
    { item: '비용 최적화 사례', checked: true },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-yellow-200';
      case 'Intermediate':
        return 'bg-blue-200';
      case 'Advanced':
        return 'bg-indigo-300';
      case 'Expert':
        return 'bg-indigo-600';
      default:
        return 'bg-gray-300';
    }
  };

  const getLevelPercentage = (level: string) => {
    switch (level) {
      case 'Beginner':
        return '25%';
      case 'Intermediate':
        return '50%';
      case 'Advanced':
        return '75%';
      case 'Expert':
        return '100%';
      default:
        return '0%';
    }
  };

  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* PROFILE HEADER */}
        <div className="mb-12 bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center border-4 border-indigo-200">
                {profile.profileImage ? (
                  <Image src={profile.profileImage} alt={profile.name} fill className="rounded-full" />
                ) : (
                  <div className="text-5xl text-indigo-400 font-bold">{profile.name[0]}</div>
                )}
              </div>
              <button className="mt-4 w-full px-3 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                사진 업로드
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
              <p className="text-xl text-indigo-600 font-semibold mb-4">{profile.title}</p>
              <p className="text-gray-600 mb-4">{profile.location}</p>
              <p className="text-gray-700 text-base leading-relaxed mb-6 max-w-2xl">{profile.bio}</p>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3 mb-6">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Globe size={18} />
                  GitHub
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Globe size={18} />
                  LinkedIn
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Mail size={18} />
                  Email
                </a>
                {profile.blog && (
                  <a
                    href={profile.blog}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <BookOpen size={18} />
                    Blog
                  </a>
                )}
              </div>

              {/* Actions */}
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                PDF로 내보내기
              </button>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* ABOUT / SUMMARY SECTION */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">소개</h2>
                <button
                  onClick={() => showAISuggestion('bio')}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <Zap size={16} />
                  AI로 개선하기
                </button>
              </div>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-700 resize-none"
                rows={4}
              />
              {activeSuggestion === 'bio' && aiSuggestion && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">💡 {aiSuggestion}</p>
                </div>
              )}
            </div>

            {/* EXPERIENCE SECTION */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase size={24} className="text-indigo-600" />
                  경력
                </h2>
                <button
                  onClick={() => showAISuggestion('experience')}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <Zap size={16} />
                  이력 설명 개선
                </button>
              </div>

              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-indigo-200 pl-6 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{exp.role}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500 mt-1">{exp.period}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingExperienceId(editingExperienceId === exp.id ? null : exp.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.techStack.map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full border border-indigo-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <Plus size={18} />
                경력 추가
              </button>

              {activeSuggestion === 'experience' && aiSuggestion && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">💡 {aiSuggestion}</p>
                </div>
              )}
            </div>

            {/* PROJECTS SECTION */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Code size={24} className="text-indigo-600" />
                  프로젝트
                </h2>
                <button
                  onClick={() => showAISuggestion('projects')}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <Zap size={16} />
                  프로젝트 설명 강화
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image Placeholder */}
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {project.image ? (
                        <Image src={project.image} alt={project.title} fill className="object-cover" />
                      ) : (
                        <Code size={48} className="text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{project.description}</p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Links */}
                      <div className="flex gap-2">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Globe size={16} />
                          GitHub
                        </a>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <ExternalLink size={16} />
                            Live
                          </a>
                        )}
                      </div>

                      {/* Edit/Delete */}
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button className="flex-1 p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <Plus size={18} />
                프로젝트 추가
              </button>

              {activeSuggestion === 'projects' && aiSuggestion && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">💡 {aiSuggestion}</p>
                </div>
              )}
            </div>

            {/* SKILLS & CERTIFICATIONS */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={24} className="text-indigo-600" />
                  기술 & 자격증
                </h2>
                <button
                  onClick={() => showAISuggestion('skills')}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <Zap size={16} />
                  스킬 갭 분석
                </button>
              </div>

              {/* Skills by Category */}
              <div className="space-y-8 mb-8">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
                    <div className="space-y-3">
                      {categorySkills.map((skill) => (
                        <div key={skill.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                            <span className="text-xs text-gray-500">{skill.level}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getLevelColor(skill.level)} transition-all`}
                              style={{ width: getLevelPercentage(skill.level) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-indigo-600" />
                  자격증
                </h3>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cert.title}</p>
                        <p className="text-sm text-gray-600">
                          {cert.issuer} • {cert.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeSuggestion === 'skills' && aiSuggestion && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">💡 {aiSuggestion}</p>
                </div>
              )}
            </div>

            {/* EDUCATION */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen size={24} className="text-indigo-600" />
                학력
              </h2>

              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{edu.university}</h3>
                    <p className="text-gray-600">{edu.degree}</p>
                    <p className="text-sm text-gray-500 mt-1">{edu.period}</p>
                  </div>
                ))}
              </div>

              <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <Plus size={18} />
                학력 추가
              </button>
            </div>
          </div>

          {/* Right Sidebar - Portfolio Coach */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Zap size={20} className="text-indigo-600" />
                포트폴리오 코치
              </h3>

              {/* Score Card */}
              <div className="mb-6 bg-white rounded-lg p-4 border border-indigo-100">
                <p className="text-xs text-gray-600 mb-2">포트폴리오 점수</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-bold text-indigo-600">82</p>
                  <span className="text-gray-600">/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '82%' }} />
                </div>
                <button
                  onClick={() => showAISuggestion('score')}
                  className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  상세 분석
                </button>
              </div>

              {activeSuggestion === 'score' && aiSuggestion && (
                <div className="mb-6 p-3 bg-white border border-indigo-200 rounded-lg">
                  <p className="text-xs text-indigo-800">{aiSuggestion}</p>
                </div>
              )}

              {/* BigTech Checklist */}
              <div>
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2 text-sm">
                  <AlertCircle size={16} />
                  빅테크 기준 체크리스트
                </h4>
                <div className="space-y-2">
                  {scoreChecklist.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        readOnly
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      <span className={`text-xs ${item.checked ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>{item.item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Completion Stats */}
              <div className="mt-6 pt-6 border-t border-indigo-200">
                <p className="text-xs text-gray-600 mb-2">완성도</p>
                <p className="text-sm font-bold text-indigo-900">
                  {scoreChecklist.filter((item) => item.checked).length}/{scoreChecklist.length} 항목 완료
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
