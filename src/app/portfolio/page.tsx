'use client';

import { useState, useEffect, useCallback } from 'react';
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
  LogIn,
  Loader2,
  Save,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

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

// Default empty state
const emptyProfile: Profile = {
  name: '',
  title: '',
  location: '',
  bio: '',
  profileImage: null,
  github: '',
  linkedin: '',
  blog: '',
  email: '',
};

export default function PortfolioPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const router = useRouter();

  // States - ALL hooks must be at the top, before any conditional returns
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // AI state (must be here, not after conditional returns)
  const [aiLoading, setAiLoading] = useState(false);
  const [portfolioScore, setPortfolioScore] = useState<number | null>(null);
  const [scoreSummary, setScoreSummary] = useState<string>('');
  const [scoreChecklist, setScoreChecklist] = useState<Array<{ item: string; checked: boolean }>>([
    { item: 'System Design 경험 시연', checked: false },
    { item: 'Open Source 기여', checked: false },
    { item: '프로젝트 설명에 영향도 메트릭 포함', checked: false },
    { item: '정량화된 성과', checked: false },
    { item: '기술 블로그', checked: false },
    { item: '컨퍼런스 발표 경험', checked: false },
    { item: '안정성 개선 사례', checked: false },
    { item: '비용 최적화 사례', checked: false },
  ]);

  // Load portfolio data from Supabase
  const loadPortfolio = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const res = await fetch(`/api/portfolio?userId=${user.id}`);
      const data = await res.json();
      if (data && !data.error) {
        // Populate from saved data, or use defaults from user metadata
        setProfile({
          name: data.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
          title: data.title || '',
          location: data.location || '',
          bio: data.bio || '',
          profileImage: data.profile_image || user.user_metadata?.avatar_url || null,
          github: data.github || user.user_metadata?.user_name ? `https://github.com/${user.user_metadata?.user_name}` : '',
          linkedin: data.linkedin || '',
          blog: data.blog || '',
          email: data.email || user.email || '',
        });
        setExperiences(data.experiences || []);
        setProjects(data.projects || []);
        setSkills(data.skills || []);
        setCertifications(data.certifications || []);
        setEducation(data.education || []);
      } else {
        // No saved data yet — use GitHub metadata as defaults
        setProfile({
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          title: '',
          location: '',
          bio: '',
          profileImage: user.user_metadata?.avatar_url || null,
          github: user.user_metadata?.user_name ? `https://github.com/${user.user_metadata?.user_name}` : '',
          linkedin: '',
          blog: '',
          email: user.email || '',
        });
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  // Save portfolio data to Supabase
  const savePortfolio = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: profile.name,
          title: profile.title,
          location: profile.location,
          bio: profile.bio,
          profile_image: profile.profileImage,
          github: profile.github,
          linkedin: profile.linkedin,
          blog: profile.blog,
          email: profile.email,
          experiences,
          projects,
          skills,
          certifications,
          education,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('저장되었습니다!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('저장 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (err) {
      setSaveMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadPortfolio();
    }
    if (!user && !authLoading) {
      setDataLoading(false);
    }
  }, [user, authLoading, loadPortfolio]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show login prompt
  if (!user) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase size={36} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">포트폴리오</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            로그인하면 나만의 DevOps/SRE 포트폴리오를 만들고 관리할 수 있어요.
            AI 코치가 빅테크 기준에 맞게 포트폴리오를 분석해 드립니다.
          </p>
          <button
            onClick={signIn}
            className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
          >
            <LogIn size={22} />
            GitHub로 로그인
          </button>
          <p className="mt-6 text-xs text-gray-500">
            GitHub 계정으로 간편하게 로그인하세요
          </p>
        </div>
      </div>
    );
  }

  // Data loading state
  if (dataLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">포트폴리오를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Build portfolio data for API calls
  const getPortfolioData = () => ({
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    experiences,
    projects,
    skills,
    certifications,
  });

  // Real AI: Improve a specific section
  const showAISuggestion = async (type: string) => {
    if (!user) return;
    setActiveSuggestion(type);
    setAiLoading(true);
    setAiSuggestion('AI가 분석 중입니다...');

    try {
      if (type === 'score') {
        // Full portfolio analysis
        const res = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze',
            userId: user.id,
            portfolio: getPortfolioData(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setPortfolioScore(data.score);
          setScoreSummary(data.summary);
          if (data.checklist && data.checklist.length > 0) {
            setScoreChecklist(data.checklist);
          }
          const feedback = [
            ...(data.strengths || []).map((s: string) => `✅ ${s}`),
            ...(data.improvements || []).map((s: string) => `💡 ${s}`),
          ].join('\n');
          setAiSuggestion(feedback || data.summary);
        } else {
          setAiSuggestion(data.error || '분석에 실패했습니다.');
        }
      } else if (type === 'skills') {
        // Skill gap analysis
        const res = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'skillgap',
            userId: user.id,
            portfolio: getPortfolioData(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          const parts: string[] = [];
          if (data.missingSkills?.length > 0) parts.push(`부족한 스킬: ${data.missingSkills.join(', ')}`);
          if (data.trendingSkills?.length > 0) parts.push(`트렌딩 스킬: ${data.trendingSkills.join(', ')}`);
          if (data.recommendations?.length > 0) parts.push(`\n추천:\n${data.recommendations.map((r: string) => `• ${r}`).join('\n')}`);
          setAiSuggestion(parts.join('\n') || '분석 결과가 없습니다.');
        } else {
          setAiSuggestion(data.error || '스킬 갭 분석에 실패했습니다.');
        }
      } else {
        // Section-specific improvement
        const sectionContentMap: Record<string, string> = {
          bio: profile.bio,
          experience: experiences.map(e => `${e.role} @ ${e.company}: ${e.description}`).join('\n'),
          projects: projects.map(p => `${p.title}: ${p.description}`).join('\n'),
        };

        const res = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'improve',
            userId: user.id,
            sectionType: type,
            sectionContent: sectionContentMap[type] || '',
            portfolio: getPortfolioData(),
          }),
        });
        const data = await res.json();
        setAiSuggestion(data.suggestion || data.error || '제안을 생성하지 못했습니다.');
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      setAiSuggestion('AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setAiLoading(false);
    }
  };

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
      <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12">
        {/* PROFILE HEADER */}
        <div className="mb-12 bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center border-4 border-indigo-200 overflow-hidden relative">
                {profile.profileImage ? (
                  <Image src={profile.profileImage} alt={profile.name || 'Profile'} fill className="rounded-full object-cover" />
                ) : (
                  <div className="text-5xl text-indigo-400 font-bold">{(profile.name || '?')[0]}</div>
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
              <div className="flex gap-3">
                <button
                  onClick={savePortfolio}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? '저장 중...' : '저장하기'}
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  PDF로 내보내기
                </button>
              </div>
              {saveMessage && (
                <p className={`mt-2 text-sm ${saveMessage.includes('실패') || saveMessage.includes('오류') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMessage}
                </p>
              )}
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
                  {aiLoading && <Loader2 size={14} className="animate-spin text-indigo-600 inline mr-2" />}
                  <p className="text-sm text-indigo-800 whitespace-pre-wrap">💡 {aiSuggestion}</p>
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
                  {aiLoading && <Loader2 size={14} className="animate-spin text-indigo-600 inline mr-2" />}
                  <p className="text-sm text-indigo-800 whitespace-pre-wrap">💡 {aiSuggestion}</p>
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
                  {aiLoading && <Loader2 size={14} className="animate-spin text-indigo-600 inline mr-2" />}
                  <p className="text-sm text-indigo-800 whitespace-pre-wrap">💡 {aiSuggestion}</p>
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
                  {aiLoading && <Loader2 size={14} className="animate-spin text-indigo-600 inline mr-2" />}
                  <p className="text-sm text-indigo-800 whitespace-pre-wrap">💡 {aiSuggestion}</p>
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
                  <p className="text-4xl font-bold text-indigo-600">{portfolioScore ?? '—'}</p>
                  <span className="text-gray-600">/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${portfolioScore ?? 0}%` }} />
                </div>
                {scoreSummary && (
                  <p className="mt-2 text-xs text-gray-600">{scoreSummary}</p>
                )}
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
