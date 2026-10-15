import React, { useState } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Card } from '../../../design-system/components/Card';
import { BottomSheet } from '../../../design-system/components/BottomSheet';
import { Button } from '../../../design-system/components/Button';
import { VoiceButton } from '../../../design-system/components/VoiceButton';
import {
  ShieldAlert,
  CreditCard,
  HeartHandshake,
  FolderLock,
  PhoneCall,
  MapPin,
  ChevronRight,
  ExternalLink,
  Scale,
  CheckCircle2,
} from 'lucide-react';

interface RightItem {
  id: string;
  titleKey: string;
  subKey: string;
  icon: React.ReactNode;
  detailTitle: string;
  detailBody: string;
}

export const RightsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<RightItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const rightsList: RightItem[] = [
    {
      id: 'labour_card',
      titleKey: 'rights.labourCard',
      subKey: 'rights.labourCardSub',
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      detailTitle: 'e-Shram & State BOCW Labour Board',
      detailBody:
        'All unorganised construction and skilled trades workers are entitled to formal registration under the Building and Other Construction Workers (BOCW) Act. Benefits include ₹2 Lakh accident insurance, free medical assistance, children education grants, and monthly pension post age 60.',
    },
    {
      id: 'insurance',
      titleKey: 'rights.insurance',
      subKey: 'rights.insuranceSub',
      icon: <HeartHandshake className="w-6 h-6 text-secondary" />,
      detailTitle: 'Pradhan Mantri Suraksha & Jeevan Jyoti Bima',
      detailBody:
        'Affordable micro-insurance with direct bank account debit. Provides ₹2,00,000 accidental risk coverage for just ₹20 per year. Available at any public bank branch or Common Service Centre (CSC).',
    },
    {
      id: 'documents',
      titleKey: 'rights.documents',
      subKey: 'rights.documentsSub',
      icon: <FolderLock className="w-6 h-6 text-trust-amber" />,
      detailTitle: 'Trade Certificate & Aadhaar Locker',
      detailBody:
        'Store and verify your National Skill Development Corporation (NSDC) or ITI certificate. Employers can trust verified workers and offer higher wages for certified skills.',
    },
    {
      id: 'wage_complaint',
      titleKey: 'rights.wageComplaint',
      subKey: 'rights.wageComplaintSub',
      icon: <Scale className="w-6 h-6 text-danger" />,
      detailTitle: 'Fair Wage Redressal & Mediation',
      detailBody:
        'If an employer or contractor delays payment past agreed terms, you can file an informal complaint or approach the nearest District Labour Officer. Chowk locks in-app contracts to support dispute clarity.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('rights.title')} />

      <main className="p-4 flex-1">
        <div className="mb-4">
          <h1 className="text-headline-sm font-extrabold text-on-surface">
            {t('rights.title')}
          </h1>
          <p className="text-body-sm text-text-secondary">
            Government schemes, social security & legal rights
          </p>
        </div>

        {/* Voice-Search Styled Input */}
        <div className="relative flex items-center mb-5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('rights.voiceSearchPlaceholder')}
            className="w-full min-h-[56px] pl-4 pr-14 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md text-on-surface font-semibold shadow-xs"
          />
          <div className="absolute right-2">
            <VoiceButton
              isCompact
              onRecordingComplete={(audio) =>
                setSearchQuery('e-Shram card accident coverage rules')
              }
            />
          </div>
        </div>

        {/* Big Tappable Rows */}
        <div className="flex flex-col gap-3">
          {rightsList.map((item) => (
            <Card
              key={item.id}
              interactive
              onClick={() => setSelectedItem(item)}
              className="p-4 flex items-center gap-3.5 bg-white border-border-subtle shadow-tier-1"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-canvas flex items-center justify-center shrink-0 border border-border-subtle">
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-title-md font-bold text-on-surface truncate">
                  {t(item.titleKey)}
                </h3>
                <p className="text-body-sm text-text-secondary line-clamp-1">{t(item.subKey)}</p>
              </div>

              <ChevronRight className="w-5 h-5 text-text-secondary/60 shrink-0" />
            </Card>
          ))}
        </div>

        {/* Nearest Help Centre Card */}
        <div className="mt-6 p-4 rounded-card bg-primary/5 border border-primary/20 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <h4 className="text-title-md font-bold text-primary">{t('rights.helpCentre')}</h4>
          </div>
          <p className="text-body-sm text-on-surface font-semibold">
            {t('rights.helpCentreAddress')}
          </p>
          <div className="pt-2 border-t border-primary/10 flex items-center justify-between text-body-sm">
            <span className="text-text-secondary font-medium">{t('rights.helpline')}</span>
            <button
              type="button"
              onClick={() => alert('Dialing Shramik Helpline 14434...')}
              className="px-3 py-1.5 rounded-pill bg-primary text-white text-xs font-bold flex items-center gap-1 active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call
            </button>
          </div>
        </div>
      </main>

      {/* Detail BottomSheet */}
      {selectedItem && (
        <BottomSheet
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.detailTitle}
        >
          <div className="flex flex-col gap-4">
            <p className="text-body-lg text-on-surface leading-relaxed">
              {selectedItem.detailBody}
            </p>

            <div className="p-3.5 rounded-card bg-surface-canvas border border-border-subtle">
              <span className="text-xs uppercase font-extrabold text-secondary block mb-1">
                Required Documents
              </span>
              <ul className="text-body-sm text-text-secondary list-disc pl-4 space-y-1">
                <li>Aadhaar card linked with mobile number</li>
                <li>Bank account passbook with IFSC code</li>
                <li>90 days construction / artisan self-declaration</li>
              </ul>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => setSelectedItem(null)}
              iconRight={<CheckCircle2 className="w-5 h-5 text-[#111B21]" />}
            >
              Got it
            </Button>
          </div>
        </BottomSheet>
      )}

      <BottomNav />
    </div>
  );
};
