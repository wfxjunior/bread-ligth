import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, ArrowLeft, Loader2 } from 'lucide-react';
import { Show } from '@clerk/react';
import { MarketingLayout } from '../components/marketing-layout';
import { useLanguage } from '../context/language-context';
import { useBillingPlan, useBillingStatus, useBillingActions } from '../hooks/use-billing';
import { isPremium, type BillingPrice } from '../lib/billing';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function PricingPage() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: planData, isLoading: pricesLoading } = useBillingPlan();
  const { data: status } = useBillingStatus();
  const { startCheckout, openBillingPortal } = useBillingActions();

  const prices = planData?.prices ?? [];
  const selectedPrice = useMemo<BillingPrice | undefined>(
    () => prices.find((p) => p.interval === interval),
    [prices, interval],
  );
  const monthlyPrice = prices.find((p) => p.interval === 'month');
  const yearlyPrice = prices.find((p) => p.interval === 'year');

  const params = new URLSearchParams(window.location.search);
  const checkoutResult = params.get('checkout');

  const alreadyPremium = isPremium(status);

  async function handleSubscribe() {
    if (!selectedPrice) return;
    setError(null);
    setPending(true);
    try {
      await startCheckout(selectedPrice.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  async function handleManage() {
    setError(null);
    setPending(true);
    try {
      await openBillingPortal();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  const features = [
    t('plan_feature_atmospheres'),
    t('plan_feature_accents'),
    t('plan_feature_mission'),
    t('plan_feature_early_access'),
    t('plan_feature_priority_support'),
  ];

  return (
    <MarketingLayout>
      <div className="max-w-2xl mx-auto px-6 py-10 md:py-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t('pricing_back_to_app')}
        </button>

          <header className="mb-10 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-serif text-4xl text-primary mb-3">{t('pricing_page_title')}</h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{t('pricing_page_subtitle')}</p>
          </header>

          {checkoutResult === 'success' && (
            <div className="mb-6 rounded-xl border border-secondary/30 bg-secondary/10 px-5 py-3.5 text-sm text-secondary font-medium flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" /> {t('pricing_checkout_success')}
            </div>
          )}
          {checkoutResult === 'cancel' && (
            <div className="mb-6 rounded-xl border border-border bg-muted px-5 py-3.5 text-sm text-muted-foreground">
              {t('pricing_checkout_cancel')}
            </div>
          )}

          <Show
            when="signed-out"
            fallback={<></>}
          >
            <div className="mb-6 rounded-xl border border-border bg-card px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-foreground">{t('pricing_sign_in_first')}</p>
              <a
                href={`${basePath}/sign-in`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors no-underline shrink-0"
              >
                {t('auth_sign_in')}
              </a>
            </div>
          </Show>

          {alreadyPremium ? (
            <div className="rounded-2xl border border-primary/20 bg-card p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-5 h-5 text-secondary" />
              </div>
              <p className="font-serif text-xl text-foreground mb-2">{t('plan_premium_plan_label')}</p>
              <p className="text-sm text-muted-foreground mb-6">{t('pricing_already_premium')}</p>
              <button
                onClick={handleManage}
                disabled={pending}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('pricing_manage_plan')}
              </button>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-center justify-center mb-7">
                  <div className="flex items-center p-1 bg-muted rounded-lg border border-border/50">
                    <button
                      onClick={() => setInterval('month')}
                      className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${interval === 'month' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {t('plan_billed_monthly')}
                    </button>
                    <button
                      onClick={() => setInterval('year')}
                      className={`relative px-5 py-2 text-sm font-medium rounded-md transition-all ${interval === 'year' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {t('plan_billed_yearly')}
                      {yearlyPrice && (
                        <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] font-bold uppercase tracking-wide">
                          {t('plan_yearly_save_badge')}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-center mb-7">
                  <h3 className="font-serif text-2xl text-foreground mb-1">{t('plan_upgrade_title')}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{t('plan_upgrade_subtitle')}</p>
                  <AnimatePresence mode="wait">
                    {pricesLoading ? (
                      <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
                        {t('plan_loading')}
                      </motion.p>
                    ) : selectedPrice ? (
                      <motion.div
                        key={selectedPrice.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-baseline justify-center gap-1"
                      >
                        <span className="font-serif text-5xl text-primary">
                          {formatMoney(selectedPrice.unitAmount, selectedPrice.currency)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {interval === 'month' ? t('plan_per_month') : t('plan_per_year')}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">
                        {t('plan_error')}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-secondary" />
                      </div>
                      <span className="text-sm text-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-center text-sm text-destructive mb-3">{error}</p>
                )}

                <Show when="signed-in">
                  <button
                    onClick={handleSubscribe}
                    disabled={pending || !selectedPrice}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> {t('plan_redirecting')}
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" /> {t('plan_trial_cta')}
                      </>
                    )}
                  </button>
                </Show>
                <Show when="signed-out">
                  <a
                    href={`${basePath}/sign-in`}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 no-underline"
                  >
                    <Crown className="w-4 h-4" /> {t('auth_sign_in')}
                  </a>
                </Show>

                <p className="text-center text-xs text-muted-foreground mt-4">{t('plan_trial_disclaimer')}</p>
                {monthlyPrice && (
                  <p className="text-center text-[11px] text-muted-foreground/70 mt-1">
                    {formatMoney(monthlyPrice.unitAmount, monthlyPrice.currency)}{t('plan_per_month')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 bg-card border border-border/50 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{t('plan_always_free_title')}</p>
            <p className="text-sm text-foreground leading-relaxed">{t('plan_always_free_desc')}</p>
            <p className="text-xs text-muted-foreground mt-2">{t('plan_no_card_required')}</p>
          </div>
        </div>
    </MarketingLayout>
  );
}
