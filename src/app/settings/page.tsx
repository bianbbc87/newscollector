'use client';

import { useState } from 'react';
import { ToggleLeft, Trash2, Plus } from 'lucide-react';

interface CrawlConfig {
  id: string;
  name: string;
  type: string;
  cron: string;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface UserProfile {
  skills: string[];
  interests: string[];
  targetCompanies: string[];
}

const mockCrawlConfigs: CrawlConfig[] = [
  {
    id: '1',
    name: 'LinkedIn Jobs',
    type: 'job',
    cron: '0 */6 * * *',
    enabled: true,
    priority: 'high',
  },
  {
    id: '2',
    name: 'GitHub Trending',
    type: 'opensource',
    cron: '0 */12 * * *',
    enabled: true,
    priority: 'high',
  },
  {
    id: '3',
    name: 'Dev.to Articles',
    type: 'trend',
    cron: '0 8 * * *',
    enabled: true,
    priority: 'medium',
  },
  {
    id: '4',
    name: 'Conference Tracker',
    type: 'conference',
    cron: '0 0 * * 0',
    enabled: false,
    priority: 'low',
  },
  {
    id: '5',
    name: 'Hackathon.com',
    type: 'hackathon',
    cron: '0 10 * * *',
    enabled: true,
    priority: 'medium',
  },
];

const mockProfile: UserProfile = {
  skills: ['Kubernetes', 'Go', 'Terraform', 'Python', 'eBPF', 'Prometheus'],
  interests: ['Infrastructure', 'Observability', 'DevOps', 'Cloud Native'],
  targetCompanies: ['Google', 'Netflix', 'Stripe', 'AWS', 'Cloudflare'],
};

const typeLabels: Record<string, string> = {
  job: '채용',
  hackathon: '해커톤',
  program: '프로그램',
  conference: '컨퍼런스',
  opensource: '오픈소스',
  trend: '트렌드',
  paper: '논문',
};

const priorityLabels: Record<string, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700',
};

export default function SettingsPage() {
  const [crawlConfigs, setCrawlConfigs] = useState<CrawlConfig[]>(mockCrawlConfigs);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const toggleCrawlConfig = (id: string) => {
    setCrawlConfigs(
      crawlConfigs.map((config) =>
        config.id === id ? { ...config, enabled: !config.enabled } : config
      )
    );
  };

  const deleteCrawlConfig = (id: string) => {
    setCrawlConfigs(crawlConfigs.filter((config) => config.id !== id));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill],
      });
      setNewSkill('');
      showSaveMessage();
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
    showSaveMessage();
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest)) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest],
      });
      setNewInterest('');
      showSaveMessage();
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== interest),
    });
    showSaveMessage();
  };

  const addCompany = () => {
    if (newCompany.trim() && !profile.targetCompanies.includes(newCompany)) {
      setProfile({
        ...profile,
        targetCompanies: [...profile.targetCompanies, newCompany],
      });
      setNewCompany('');
      showSaveMessage();
    }
  };

  const removeCompany = (company: string) => {
    setProfile({
      ...profile,
      targetCompanies: profile.targetCompanies.filter((c) => c !== company),
    });
    showSaveMessage();
  };

  const showSaveMessage = () => {
    setSaveMessage('저장되었습니다');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleCronChange = (id: string, newCron: string) => {
    setCrawlConfigs(
      crawlConfigs.map((config) =>
        config.id === id ? { ...config, cron: newCron } : config
      )
    );
    showSaveMessage();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl pb-32 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-500">크롤 설정 및 프로필 관리</p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {saveMessage}
        </div>
      )}

      {/* Crawl Configurations */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">크롤 설정</h2>
        <p className="text-sm text-gray-500 mb-6">
          데이터 소스의 크롤 주기와 우선순위를 관리하세요
        </p>

        <div className="space-y-4">
          {crawlConfigs.map((config) => (
            <div key={config.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900">{config.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {typeLabels[config.type]}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        priorityColors[config.priority]
                      }`}
                    >
                      {priorityLabels[config.priority]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Cron: {config.cron}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleCrawlConfig(config.id)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 flex items-center ${
                      config.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                        config.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteCrawlConfig(config.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Cron Edit */}
              <div className="pt-4 border-t border-gray-200">
                <label className="text-xs text-gray-500 block mb-2">Cron 표현식</label>
                <input
                  type="text"
                  value={config.cron}
                  onChange={(e) => handleCronChange(config.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0 8 * * *"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Settings */}
      <div className="space-y-8">
        {/* Skills */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">기술 스택</h2>
          <p className="text-sm text-gray-500 mb-6">
            보유한 기술과 도구를 추가하세요. 관련 기회를 더 정확하게 추천받을 수 있습니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {profile.skills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-full"
              >
                <span className="text-sm text-blue-700">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-blue-600 hover:text-blue-800 text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="예: Kubernetes, Go, Terraform"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button onClick={addSkill} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={18} />
              <span>추가</span>
            </button>
          </div>
        </div>

        {/* Interests */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">관심 분야</h2>
          <p className="text-sm text-gray-500 mb-6">
            관심 있는 분야를 추가하세요. 해당 분야의 기회를 우선 추천합니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {profile.interests.map((interest) => (
              <div
                key={interest}
                className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-2 rounded-full"
              >
                <span className="text-sm text-purple-700">{interest}</span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-purple-600 hover:text-purple-800 text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              placeholder="예: Infrastructure, Observability"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button onClick={addInterest} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={18} />
              <span>추가</span>
            </button>
          </div>
        </div>

        {/* Target Companies */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">관심 기업</h2>
          <p className="text-sm text-gray-500 mb-6">
            지원하고 싶은 기업을 추가하세요. 해당 기업의 기회를 우선 추천합니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {profile.targetCompanies.map((company) => (
              <div
                key={company}
                className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-full"
              >
                <span className="text-sm text-green-700">{company}</span>
                <button
                  onClick={() => removeCompany(company)}
                  className="text-green-600 hover:text-green-800 text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCompany()}
              placeholder="예: Google, Netflix, Stripe"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button onClick={addCompany} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={18} />
              <span>추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-12 bg-cyan-50 rounded-lg border border-cyan-200 border-l-4 border-l-cyan-500 shadow-sm p-6">
        <h3 className="font-semibold text-cyan-900 mb-3">팁</h3>
        <ul className="space-y-2 text-sm text-cyan-800">
          <li>• 기술 스택을 자주 업데이트하면 더 정확한 추천을 받을 수 있습니다</li>
          <li>• 크롤 설정의 주기(Cron)를 조정하여 업데이트 빈도를 제어할 수 있습니다</li>
          <li>• 우선순위가 높은 소스는 더 자주 크롤됩니다</li>
        </ul>
      </div>
    </div>
  );
}
