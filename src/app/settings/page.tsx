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
  high: 'bg-red-900 text-red-300',
  medium: 'bg-yellow-900 text-yellow-300',
  low: 'bg-gray-800 text-gray-300',
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
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">설정</h1>
        <p className="text-gray-400">크롤 설정 및 프로필 관리</p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="mb-4 p-3 bg-green-900 border border-green-800 rounded-lg text-green-300 text-sm">
          {saveMessage}
        </div>
      )}

      {/* Crawl Configurations */}
      <div className="mb-12">
        <h2 className="subsection-title mb-4">크롤 설정</h2>
        <p className="text-sm text-gray-400 mb-4">
          데이터 소스의 크롤 주기와 우선순위를 관리하세요
        </p>

        <div className="space-y-3">
          {crawlConfigs.map((config) => (
            <div key={config.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{config.name}</h3>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
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
                  <p className="text-sm text-gray-400">Cron: {config.cron}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleCrawlConfig(config.id)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 flex items-center ${
                      config.enabled ? 'bg-blue-600' : 'bg-gray-700'
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
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Cron Edit */}
              <div className="pt-3 border-t border-gray-800">
                <label className="text-xs text-gray-400 block mb-2">Cron 표현식</label>
                <input
                  type="text"
                  value={config.cron}
                  onChange={(e) => handleCronChange(config.id, e.target.value)}
                  className="input-field text-sm"
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
          <h2 className="subsection-title mb-4">기술 스택</h2>
          <p className="text-sm text-gray-400 mb-4">
            보유한 기술과 도구를 추가하세요. 관련 기회를 더 정확하게 추천받을 수 있습니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {profile.skills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2 bg-blue-900 border border-blue-800 px-3 py-1.5 rounded-full"
              >
                <span className="text-sm text-blue-300">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-blue-400 hover:text-blue-200 text-xs ml-1"
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
              className="input-field flex-1"
            />
            <button onClick={addSkill} className="button-primary flex items-center gap-2">
              <Plus size={18} />
              <span>추가</span>
            </button>
          </div>
        </div>

        {/* Interests */}
        <div>
          <h2 className="subsection-title mb-4">관심 분야</h2>
          <p className="text-sm text-gray-400 mb-4">
            관심 있는 분야를 추가하세요. 해당 분야의 기회를 우선 추천합니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {profile.interests.map((interest) => (
              <div
                key={interest}
                className="flex items-center gap-2 bg-purple-900 border border-purple-800 px-3 py-1.5 rounded-full"
              >
                <span className="text-sm text-purple-300">{interest}</span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-purple-400 hover:text-purple-200 text-xs ml-1"
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
              className="input-field flex-1"
            />
            <button onClick={addInterest} className="button-primary flex items-center gap-2">
              <Plus size={18} />
              <span>추가</span>
            </button>
          </div>
        </div>

        {/* Target Companies */}
        <div>
          <h2 className="subsection-title mb-4">관심 기업</h2>
          <p className="text-sm text-gray-400 mb-4">
            지원하고 싶은 기업을 추가하세요. 해당 기업의 기회를 우선 추천합니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {profile.targetCompanies.map((company) => (
              <div
                key={company}
                className="flex items-center gap-2 bg-green-900 border border-green-800 px-3 py-1.5 rounded-full"
              >
                <span className="text-sm text-green-300">{company}</span>
                <button
                  onClick={() => removeCompany(company)}
                  className="text-green-400 hover:text-green-200 text-xs ml-1"
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
              className="input-field flex-1"
            />
            <button onClick={addCompany} className="button-primary flex items-center gap-2">
              <Plus size={18} />
              <span>추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-12 card border-l-4 border-l-cyan-500 bg-cyan-950/20">
        <h3 className="font-semibold text-cyan-300 mb-2">💡 팁</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• 기술 스택을 자주 업데이트하면 더 정확한 추천을 받을 수 있습니다</li>
          <li>• 크롤 설정의 주기(Cron)를 조정하여 업데이트 빈도를 제어할 수 있습니다</li>
          <li>• 우선순위가 높은 소스는 더 자주 크롤됩니다</li>
        </ul>
      </div>
    </div>
  );
}
