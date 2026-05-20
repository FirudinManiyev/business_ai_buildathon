import { useState } from 'react';
import { Briefcase, MapPin, Banknote, Bot, ChevronDown, ChevronUp } from 'lucide-react';

const JOBS = [
  { id: 1, title: 'React Developer', company: 'TechAZ MMC', location: 'Bakı', salary: '1200–1800 AZN', type: 'Tam Ştat', tags: ['React', 'TypeScript', 'REST API'] },
  { id: 2, title: 'Mühasib', company: 'Finans Şirkəti', location: 'Bakı', salary: '800–1100 AZN', type: 'Tam Ştat', tags: ['1C', 'Excel', 'Vergi Uçotu'] },
  { id: 3, title: 'Satış Meneceri', company: 'Retail Pro', location: 'Sumqayıt', salary: '600–1000 AZN', type: 'Hibrid', tags: ['Satış', 'CRM', 'Danışıqlar'] },
  { id: 4, title: 'UI/UX Dizayner', company: 'CreativeLab', location: 'Remote', salary: '1500–2200 AZN', type: 'Uzaqdan', tags: ['Figma', 'Prototyping', 'Tailwind'] },
];

function getAIAdvice(skills: string, jobTags: string[]): string {
  const low = skills.toLowerCase();
  const missing = jobTags.filter((t) => !low.includes(t.toLowerCase()));
  if (!skills.trim()) return 'Zəhmət olmasa bacarıqlarınızı qeyd edin ki, AI analiz edə bilsin.';
  if (missing.length === 0) return '✅ Əla! Sizin bacarıqlarınız bu vəzifə üçün çox uyğundur. Müraciəti inamla göndərin.';

  const advice: Record<string, string> = {
    React: 'React öyrənmək üçün resmi docs + freeCodeCamp tövsiyə olunur.',
    TypeScript: 'TypeScript üçün "Total TypeScript" kursuna baxın.',
    'REST API': 'Postman ilə REST API praktikası edin, real layihə qurun.',
    '1C': '1C:Mühasibat sertifikatı alın, bu sahədə çox dəyərlidir.',
    Excel: 'Microsoft Excel Expert sertifikatı sizə üstünlük verər.',
    'Vergi Uçotu': 'Azərbaycan Vergi Məcəlləsini öyrənin, xüsusi kurslar var.',
    Satış: 'SPIN Satış metodologiyasını öyrənin, effektivliyi artırır.',
    CRM: 'HubSpot CRM pulsuz kursu keçin, sertifikat alın.',
    Danışıqlar: '"Never Split the Difference" kitabını oxuyun.',
    Figma: 'Figma-nın rəsmi YouTube kanalı başlanğıc üçün idealdır.',
    Prototyping: 'Şəxsi portfel qurun, real UX case study-ləri göstərin.',
    Tailwind: 'Tailwind CSS Docs + Tailwind UI nümunələrini incəleyin.',
  };

  const tips = missing.map((m) => `• **${m}**: ${advice[m] ?? 'Bu bacarığı gücləndirib CV-yə əlavə edin.'}`);
  return `⚠️ Aşağıdakı sahələri gücləndirsəniz daha güclü namizəd olarısınız:\n\n${tips.join('\n')}`;
}

export default function Jobs() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [skills, setSkills] = useState<Record<number, string>>({});
  const [advice, setAdvice] = useState<Record<number, string>>({});

  const toggleOpen = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  const analyze = (job: (typeof JOBS)[0]) => {
    const result = getAIAdvice(skills[job.id] ?? '', job.tags);
    setAdvice((prev) => ({ ...prev, [job.id]: result }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          <Briefcase className="text-orange-400" size={36} /> İş Elanları
        </h1>
        <p className="text-gray-400">Uyğun vəzifəni tap, AI CV tövsiyəsini al.</p>
      </div>

      <div className="flex flex-col gap-4">
        {JOBS.map((job) => (
          <div
            key={job.id}
            className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl overflow-hidden hover:border-orange-500/40 transition-colors"
          >
            {/* Job header */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Briefcase size={22} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{job.title}</h3>
                <p className="text-orange-400 text-sm">{job.company}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-gray-400 text-xs">
                  <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                  <span className="flex items-center gap-1"><Banknote size={12} />{job.salary}</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">{job.type}</span>
                </div>
              </div>
              <button
                onClick={() => toggleOpen(job.id)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                Müraciət Et {openId === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Required tags */}
            <div className="px-5 pb-3 flex gap-2 flex-wrap">
              {job.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-300 text-xs">{tag}</span>
              ))}
            </div>

            {/* Expandable AI form */}
            {openId === job.id && (
              <div className="border-t border-orange-500/20 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-orange-400 font-semibold">
                  <Bot size={18} /> AI CV Analizi
                </div>
                <textarea
                  rows={3}
                  placeholder="Bacarıqlarınızı yazın (məs: React, TypeScript, 2 il təcrübə...)"
                  value={skills[job.id] ?? ''}
                  onChange={(e) => setSkills((prev) => ({ ...prev, [job.id]: e.target.value }))}
                  className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                />
                <button
                  onClick={() => analyze(job)}
                  className="self-start flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 text-orange-400 font-medium px-5 py-2 rounded-xl text-sm transition-colors"
                >
                  <Bot size={16} /> Analiz Et
                </button>
                {advice[job.id] && (
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-gray-300 text-sm whitespace-pre-line">
                    {advice[job.id]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
